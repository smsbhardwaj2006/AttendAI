from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import User
from apps.academics.models import Section
from apps.students.models import FaceEmbedding, Student


class StudentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    section_label = serializers.SerializerMethodField()
    attendance_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'roll_no', 'name', 'email', 'course', 'section', 'section_label',
            'department_name', 'admission_year', 'date_of_birth',
            'face_enrollment_status', 'attendance_percentage', 'created_at',
        ]

    def get_section_label(self, obj):
        return f'{obj.course.code}-{obj.section.name}'

    def get_attendance_percentage(self, obj):
        from apps.attendance.models import AttendanceRecord

        records = AttendanceRecord.objects.filter(student=obj)
        total = records.count()
        if total == 0:
            return None
        present = records.filter(status__in=['present', 'late']).count()
        return round(present / total * 100, 1)


class StudentCreateSerializer(serializers.Serializer):
    """Creates a User(role=student) + linked Student profile in one call."""

    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()
    roll_no = serializers.CharField()
    course = serializers.PrimaryKeyRelatedField(queryset=Section.objects.none())  # replaced below
    section = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())
    admission_year = serializers.IntegerField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from apps.academics.models import Course

        self.fields['course'] = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['roll_no'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            role=User.Role.STUDENT,
            password=User.objects.make_random_password(),
        )
        return Student.objects.create(
            user=user,
            roll_no=validated_data['roll_no'],
            course=validated_data['course'],
            section=validated_data['section'],
            admission_year=validated_data['admission_year'],
        )


class FaceEmbeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceEmbedding
        fields = ['id', 'pose_label', 'quality_score', 'is_active', 'created_at']


class FaceEnrollmentStatusSerializer(serializers.ModelSerializer):
    samples_captured = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['face_enrollment_status', 'samples_captured']

    def get_samples_captured(self, obj):
        return obj.face_embeddings.filter(is_active=True).count()
