import uuid

from django.conf import settings
from django.db import models


class AttendanceSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey('academics.Subject', on_delete=models.PROTECT, related_name='sessions')
    section = models.ForeignKey('academics.Section', on_delete=models.PROTECT, related_name='sessions')
    classroom = models.ForeignKey('academics.Classroom', on_delete=models.PROTECT, related_name='sessions')
    faculty = models.ForeignKey('faculty.FacultyProfile', on_delete=models.PROTECT, related_name='sessions')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SCHEDULED)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject.name} — {self.section} — {self.created_at:%d %b %Y}'


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        LATE = 'late', 'Late'
        ABSENT = 'absent', 'Absent'
        SPOOF_DETECTED = 'spoof_detected', 'Spoof Detected'

    class Method(models.TextChoices):
        AUTO = 'auto', 'Automatic (AI)'
        MANUAL = 'manual', 'Manual Correction'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.ABSENT)
    confidence = models.FloatField(null=True, blank=True)
    method = models.CharField(max_length=10, choices=Method.choices, default=Method.AUTO)
    marked_at = models.DateTimeField(null=True, blank=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='manual_corrections'
    )
    needs_verification = models.BooleanField(default=False)

    class Meta:
        db_table = 'attendance_records'
        unique_together = ('session', 'student')
        ordering = ['-marked_at']

    def __str__(self):
        return f'{self.student.roll_no} — {self.session} — {self.status}'


class UnknownFaceLog(models.Model):
    """Populated when a detected face can't be matched (or fails
    anti-spoofing) during a live session — feeds the Admin dashboard's
    'Unknown Face Detection Logs' widget and the manual verification
    queue."""

    class Reason(models.TextChoices):
        NO_MATCH = 'no_match', 'No enrolled match found'
        LOW_CONFIDENCE = 'low_confidence', 'Low confidence match'
        SPOOF_SUSPECTED = 'spoof_suspected', 'Spoof attempt suspected'
        NOT_ENROLLED = 'not_enrolled', 'Face not enrolled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        AttendanceSession, on_delete=models.CASCADE, related_name='unknown_face_logs', null=True, blank=True
    )
    classroom = models.ForeignKey('academics.Classroom', on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=20, choices=Reason.choices)
    confidence = models.FloatField(null=True, blank=True)
    candidate_student = models.ForeignKey(
        'students.Student', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    frame_image = models.ImageField(upload_to='session_frames/%Y/%m/', null=True, blank=True)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'unknown_face_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_reason_display()} @ {self.created_at:%d %b %Y %H:%M}'
