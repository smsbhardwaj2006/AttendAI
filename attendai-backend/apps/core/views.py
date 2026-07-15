from django.utils import timezone
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin
from apps.core.models import ActivityLog, AISettings
from apps.core.serializers import ActivityLogSerializer, AISettingsSerializer


class ActivityLogListView(generics.ListAPIView):
    queryset = ActivityLog.objects.select_related('actor').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['action']


class AISettingsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(AISettingsSerializer(AISettings.current()).data)

    def patch(self, request):
        settings_obj = AISettings.current()
        serializer = AISettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)

        ActivityLog.objects.create(
            actor=request.user,
            action='ai_settings_updated',
            target='AI Recognition Settings',
            metadata=serializer.validated_data,
        )
        return Response(serializer.data)


class SystemStatsView(APIView):
    """GET /api/admin/stats/ — headline numbers for the Admin dashboard's
    StatCards and the unknown-face-detection log widget."""

    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.attendance.models import AttendanceRecord, UnknownFaceLog
        from apps.faculty.models import FacultyProfile
        from apps.students.models import Student

        today = timezone.now().date()
        today_records = AttendanceRecord.objects.filter(session__started_at__date=today)
        total_today = today_records.count()
        present_today = today_records.filter(status__in=['present', 'late']).count()

        return Response(
            {
                'total_students': Student.objects.count(),
                'total_faculty': FacultyProfile.objects.count(),
                'today_attendance_percentage': (
                    round(present_today / total_today * 100, 1) if total_today else None
                ),
                'unknown_face_logs_today': UnknownFaceLog.objects.filter(created_at__date=today).count(),
            }
        )
