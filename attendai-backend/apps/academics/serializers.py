from rest_framework import serializers

from apps.academics.models import Classroom, Course, Department, Section, Subject


class DepartmentSerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)
    student_count = serializers.SerializerMethodField()
    faculty_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'course_count', 'student_count', 'faculty_count', 'created_at']

    def get_student_count(self, obj):
        from apps.students.models import Student

        return Student.objects.filter(course__department=obj).count()

    def get_faculty_count(self, obj):
        from apps.faculty.models import FacultyProfile

        return FacultyProfile.objects.filter(department=obj).count()


class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'department', 'department_name', 'name', 'code', 'duration_years']


class SubjectSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'course', 'course_name', 'name', 'code', 'semester', 'credits']


class SectionSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    label = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'course', 'course_code', 'name', 'semester', 'label']

    def get_label(self, obj):
        return f'{obj.course.code}-{obj.name}'


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'building', 'capacity', 'camera_id']
