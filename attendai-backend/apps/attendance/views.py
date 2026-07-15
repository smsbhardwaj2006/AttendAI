from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrFaculty, IsFaculty
from apps.ai_engine.exceptions import (
    LowConfidenceMatchError,
    NoFaceDetectedError,
    NoMatchFoundError,
    SpoofDetectedError,
)
from apps.ai_engine.pipeline import recognize_frame
from apps.attendance.models import AttendanceRecord, AttendanceSession, UnknownFaceLog
from apps.attendance.serializers import (
    AttendanceRecordSerializer,
    AttendanceSessionSerializer,
    ManualAttendanceUpdateSerializer,
    UnknownFaceLogSerializer,
)
from apps.core.models import ActivityLog, AISettings
from apps.notifications.models import Notification
from apps.students.models import FaceEmbedding, Student


class AttendanceSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAdminOrFaculty]
    filterset_fields = ['status', 'subject', 'section']

    def get_queryset(self):
        qs = AttendanceSession.objects.select_related('subject', 'section', 'classroom', 'faculty').all()
        if self.request.user.role == 'faculty':
            qs = qs.filter(faculty__user=self.request.user)
        return qs

    def perform_create(self, serializer):
        faculty_profile = self.request.user.faculty_profile
        session = serializer.save(faculty=faculty_profile, status=AttendanceSession.Status.ACTIVE, started_at=timezone.now())

        # Pre-populate one AttendanceRecord (default: absent) per student in
        # the section, so the session starts with a full roster that gets
        # flipped to present/late as faces are recognized.
        students = Student.objects.filter(section=session.section)
        AttendanceRecord.objects.bulk_create(
            [AttendanceRecord(session=session, student=s) for s in students], ignore_conflicts=True
        )
        ActivityLog.objects.create(
            actor=self.request.user, action='session_started', target=str(session), metadata={'session_id': str(session.id)}
        )


class AttendanceSessionDetailView(generics.RetrieveAPIView):
    queryset = AttendanceSession.objects.select_related('subject', 'section', 'classroom', 'faculty')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAdminOrFaculty]


class EndSessionView(APIView):
    permission_classes = [IsFaculty]

    def post(self, request, pk):
        session = get_object_or_404(AttendanceSession, pk=pk)
        session.status = AttendanceSession.Status.COMPLETED
        session.ended_at = timezone.now()
        session.save(update_fields=['status', 'ended_at'])

        ActivityLog.objects.create(actor=request.user, action='session_ended', target=str(session))
        return Response(AttendanceSessionSerializer(session).data)


class RecognizeFrameView(APIView):
    """
    POST /api/attendance/sessions/{id}/recognize/
    Accepts a single multipart image under the field name `frame` (matches
    LiveAttendanceMonitor, which posts a webcam screenshot every ~2.5s).
    Runs the full AI workflow and returns `{recognitions: [...]}` for the
    frontend's live feed. Implements PRD workflow steps 3-11.
    """

    permission_classes = [IsFaculty]
    parser_classes = [MultiPartParser, FormParser]
    throttle_scope = 'recognize'

    def post(self, request, pk):
        session = get_object_or_404(AttendanceSession, pk=pk, status=AttendanceSession.Status.ACTIVE)
        frame = request.FILES.get('frame')
        if not frame:
            return Response({'detail': 'No frame provided.'}, status=status.HTTP_400_BAD_REQUEST)

        image_bytes = frame.read()
        ai_settings = AISettings.current()

        candidates = list(
            FaceEmbedding.objects.filter(student__section=session.section, is_active=True).values_list(
                'student_id', 'vector'
            )
        )

        try:
            result = recognize_frame(image_bytes, candidates, confidence_threshold=ai_settings.confidence_threshold)
        except SpoofDetectedError as exc:
            UnknownFaceLog.objects.create(
                session=session, classroom=session.classroom, reason=UnknownFaceLog.Reason.SPOOF_SUSPECTED
            )
            return Response({'recognitions': [], 'flag': {'reason': exc.code, 'message': exc.message}})
        except LowConfidenceMatchError as exc:
            UnknownFaceLog.objects.create(
                session=session,
                classroom=session.classroom,
                reason=UnknownFaceLog.Reason.LOW_CONFIDENCE,
                confidence=exc.confidence,
                candidate_student_id=exc.candidate_student_id,
            )
            record = AttendanceRecord.objects.filter(session=session, student_id=exc.candidate_student_id).first()
            if record:
                record.needs_verification = True
                record.confidence = exc.confidence
                record.save(update_fields=['needs_verification', 'confidence'])
            return Response({'recognitions': [], 'flag': {'reason': exc.code, 'message': exc.message}})
        except (NoFaceDetectedError, NoMatchFoundError) as exc:
            return Response({'recognitions': [], 'flag': {'reason': exc.code, 'message': exc.message}})

        student = get_object_or_404(Student, pk=result.student_id)
        now = timezone.now()
        is_late = session.started_at and (now - session.started_at).total_seconds() > 600  # 10 min grace period
        record_status = AttendanceRecord.Status.LATE if is_late else AttendanceRecord.Status.PRESENT

        record, _ = AttendanceRecord.objects.update_or_create(
            session=session,
            student=student,
            defaults={
                'status': record_status,
                'confidence': result.confidence,
                'method': AttendanceRecord.Method.AUTO,
                'marked_at': now,
                'needs_verification': False,
            },
        )

        Notification.objects.create(
            user=student.user,
            type=Notification.Type.SUCCESS,
            title='Attendance marked',
            body=f'Marked {record_status} for {session.subject.name} at {now:%I:%M %p}',
        )

        return Response(
            {
                'recognitions': [
                    {
                        'id': str(record.id),
                        'name': student.user.get_full_name(),
                        'rollNo': student.roll_no,
                        'confidence': result.confidence,
                        'status': record_status,
                        'time': now.strftime('%I:%M %p'),
                    }
                ]
            }
        )


class SessionRecordsView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAdminOrFaculty]

    def get_queryset(self):
        return AttendanceRecord.objects.filter(session_id=self.kwargs['pk']).select_related(
            'student__user', 'session__subject'
        )


class ManualAttendanceUpdateView(generics.UpdateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = ManualAttendanceUpdateSerializer
    permission_classes = [IsAdminOrFaculty]

    def perform_update(self, serializer):
        record = serializer.save(method=AttendanceRecord.Method.MANUAL, marked_by=self.request.user, marked_at=timezone.now(), needs_verification=False)
        ActivityLog.objects.create(
            actor=self.request.user,
            action='attendance_manually_corrected',
            target=f'{record.student.roll_no} — {record.status}',
        )


class VerificationQueueView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAdminOrFaculty]

    def get_queryset(self):
        return AttendanceRecord.objects.filter(session_id=self.kwargs['pk'], needs_verification=True).select_related(
            'student__user'
        )


class UnknownFaceLogListView(generics.ListAPIView):
    queryset = UnknownFaceLog.objects.select_related('classroom', 'candidate_student__user').all()
    serializer_class = UnknownFaceLogSerializer
    permission_classes = [IsAdminOrFaculty]
    filterset_fields = ['reason', 'resolved', 'classroom']


class DailySummaryView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        date = request.query_params.get('date', timezone.now().date().isoformat())
        records = AttendanceRecord.objects.filter(session__started_at__date=date)
        return Response(_status_breakdown(records))


class MonthlySummaryView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        records = AttendanceRecord.objects.filter(session__started_at__year=year, session__started_at__month=month)
        return Response(_status_breakdown(records))


class SubjectWiseSummaryView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        data = (
            AttendanceRecord.objects.values('session__subject__name')
            .annotate(
                total=Count('id'),
                present=Count('id', filter=Q(status__in=['present', 'late'])),
            )
            .order_by('session__subject__name')
        )
        return Response(
            [
                {
                    'subject': row['session__subject__name'],
                    'attendance_percentage': round(row['present'] / row['total'] * 100, 1) if row['total'] else 0,
                }
                for row in data
            ]
        )


class HeatmapView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        data = (
            AttendanceRecord.objects.filter(marked_at__isnull=False)
            .values('session__started_at__date')
            .annotate(
                total=Count('id'),
                present=Count('id', filter=Q(status__in=['present', 'late'])),
            )
            .order_by('session__started_at__date')
        )
        return Response(
            [
                {
                    'date': row['session__started_at__date'],
                    'attendance_percentage': round(row['present'] / row['total'] * 100, 1) if row['total'] else 0,
                }
                for row in data
            ]
        )


def _status_breakdown(records):
    total = records.count()
    present = records.filter(status='present').count()
    late = records.filter(status='late').count()
    absent = records.filter(status='absent').count()
    spoof = records.filter(status='spoof_detected').count()
    return {
        'total': total,
        'present': present,
        'late': late,
        'absent': absent,
        'spoof_detected': spoof,
        'attendance_percentage': round((present + late) / total * 100, 1) if total else 0,
    }
