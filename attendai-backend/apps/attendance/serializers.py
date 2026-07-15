from rest_framework import serializers

from apps.attendance.models import AttendanceRecord, AttendanceSession, UnknownFaceLog


class AttendanceSessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_label = serializers.SerializerMethodField()
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.user.get_full_name', read_only=True)
    present_count = serializers.SerializerMethodField()
    total_count = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'subject', 'subject_name', 'section', 'section_label', 'classroom', 'classroom_name',
            'faculty', 'faculty_name', 'status', 'started_at', 'ended_at', 'created_at',
            'present_count', 'total_count',
        ]
        read_only_fields = ['status', 'started_at', 'ended_at', 'faculty']

    def get_section_label(self, obj):
        return f'{obj.section.course.code}-{obj.section.name}'

    def get_present_count(self, obj):
        return obj.records.filter(status__in=['present', 'late']).count()

    def get_total_count(self, obj):
        return obj.records.count()


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    subject_name = serializers.CharField(source='session.subject.name', read_only=True)
    session_date = serializers.DateTimeField(source='session.started_at', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'session', 'student', 'student_name', 'roll_no', 'subject_name', 'session_date',
            'status', 'confidence', 'method', 'marked_at', 'needs_verification',
        ]
        read_only_fields = ['session', 'student', 'method', 'confidence']


class ManualAttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = ['status']


class UnknownFaceLogSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    candidate_name = serializers.CharField(source='candidate_student.user.get_full_name', read_only=True)

    class Meta:
        model = UnknownFaceLog
        fields = [
            'id', 'session', 'classroom', 'classroom_name', 'reason', 'confidence',
            'candidate_student', 'candidate_name', 'resolved', 'created_at',
        ]


class RecognizeFrameResponseSerializer(serializers.Serializer):
    """Documents the shape returned by RecognizeFrameView — matches what
    the frontend's LiveAttendanceMonitor expects in `recognitions[]`."""

    id = serializers.CharField()
    name = serializers.CharField()
    rollNo = serializers.CharField()
    confidence = serializers.FloatField()
    status = serializers.CharField()
    time = serializers.CharField()
