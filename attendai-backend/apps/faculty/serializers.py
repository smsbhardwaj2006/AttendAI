from django.db import transaction
from rest_framework import serializers

from apps.academics.models import Classroom, Department, Subject
from apps.accounts.models import User
from apps.faculty.models import FacultyProfile


class FacultySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    subject_names = serializers.SerializerMethodField()

    class Meta:
        model = FacultyProfile
        fields = ['id', 'employee_id', 'name', 'email', 'department', 'department_name', 'subject_names', 'created_at']

    def get_subject_names(self, obj):
        return list(obj.subjects.values_list('name', flat=True))


class FacultyCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()
    employee_id = serializers.CharField()
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    subjects = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), many=True, required=False)

    @transaction.atomic
    def create(self, validated_data):
        subjects = validated_data.pop('subjects', [])
        user = User.objects.create_user(
            username=validated_data['employee_id'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            role=User.Role.FACULTY,
            password=User.objects.make_random_password(),
        )
        faculty = FacultyProfile.objects.create(
            user=user, employee_id=validated_data['employee_id'], department=validated_data['department']
        )
        if subjects:
            faculty.subjects.set(subjects)
        return faculty


class AssignSubjectsSerializer(serializers.Serializer):
    subjects = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), many=True)


class AssignClassroomsSerializer(serializers.Serializer):
    classrooms = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all(), many=True)
