from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsAdminOrFaculty, IsSelfOrAdmin
from apps.ai_engine.exceptions import AIEngineError
from apps.ai_engine.pipeline import process_enrollment_sample
from apps.core.models import ActivityLog
from apps.students.models import FaceEmbedding, Student
from apps.students.serializers import (
    FaceEnrollmentStatusSerializer,
    StudentCreateSerializer,
    StudentSerializer,
)

REQUIRED_ENROLLMENT_SAMPLES = 5


class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.select_related('user', 'course', 'section').all()
    filterset_fields = ['course', 'section', 'face_enrollment_status']
    search_fields = ['roll_no', 'user__first_name', 'user__last_name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrFaculty()]

    def get_serializer_class(self):
        return StudentCreateSerializer if self.request.method == 'POST' else StudentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        ActivityLog.objects.create(actor=request.user, action='student_created', target=student.roll_no)
        return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.select_related('user', 'course', 'section').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminOrFaculty]

    def perform_destroy(self, instance):
        ActivityLog.objects.create(actor=self.request.user, action='student_removed', target=instance.roll_no)
        instance.user.is_active_profile = False
        instance.user.save(update_fields=['is_active_profile'])
        instance.delete()


class StudentAttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsSelfOrAdmin]

    def get(self, request, pk):
        from apps.attendance.serializers import AttendanceRecordSerializer

        student = get_object_or_404(Student, pk=pk)
        self.check_object_permissions(request, student)

        records = student.attendance_records.select_related('session__subject').order_by('-session__started_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            records = records.filter(status=status_filter)

        return Response(AttendanceRecordSerializer(records, many=True).data)


class FaceEnrollmentView(APIView):
    """
    POST /api/students/{id}/face-enrollment/
    Accepts multipart form data with up to 5 image files under the field
    name `samples` (matches the frontend's FaceEnrollmentCapture, which
    captures 5 poses). Runs each through the AI pipeline, stores embeddings,
    and flips the student's enrollment status to `pending` for admin review
    (or `enrolled` directly if auto-approval is desired — see comment below).
    """

    permission_classes = [IsAuthenticated, IsSelfOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        self.check_object_permissions(request, student)

        samples = request.FILES.getlist('samples')
        if not samples:
            return Response({'detail': 'No image samples provided.'}, status=status.HTTP_400_BAD_REQUEST)

        created, failures = [], []
        for i, sample in enumerate(samples):
            image_bytes = sample.read()
            try:
                result = process_enrollment_sample(image_bytes)
            except AIEngineError as exc:
                failures.append({'sample_index': i, 'reason': exc.message, 'code': exc.code})
                continue

            sample.seek(0)
            embedding = FaceEmbedding.objects.create(
                student=student,
                vector=result.embedding,
                sample_image=sample,
                quality_score=result.quality_score,
                pose_label=result.pose_label,
            )
            created.append(embedding)

        total_active = student.face_embeddings.filter(is_active=True).count()
        if total_active >= REQUIRED_ENROLLMENT_SAMPLES:
            student.face_enrollment_status = Student.EnrollmentStatus.PENDING
        student.save(update_fields=['face_enrollment_status'])

        ActivityLog.objects.create(
            actor=request.user,
            action='face_enrollment_submitted',
            target=student.roll_no,
            metadata={'samples_accepted': len(created), 'samples_rejected': len(failures)},
        )

        return Response(
            {
                'accepted': len(created),
                'rejected': failures,
                'enrollment_status': student.face_enrollment_status,
                'samples_captured': total_active,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST,
        )


class FaceEnrollmentStatusView(APIView):
    permission_classes = [IsAuthenticated, IsSelfOrAdmin]

    def get(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        self.check_object_permissions(request, student)
        return Response(FaceEnrollmentStatusSerializer(student).data)
