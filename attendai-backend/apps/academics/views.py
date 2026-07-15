from rest_framework import generics

from apps.academics.models import Classroom, Course, Department, Section, Subject
from apps.academics.serializers import (
    ClassroomSerializer,
    CourseSerializer,
    DepartmentSerializer,
    SectionSerializer,
    SubjectSerializer,
)
from apps.accounts.permissions import IsAdmin, IsAdminOrFaculty


class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrFaculty()]


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.select_related('department').all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrFaculty]
    filterset_fields = ['department']


class SubjectListView(generics.ListAPIView):
    queryset = Subject.objects.select_related('course').all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrFaculty]
    filterset_fields = ['course', 'semester']


class SectionListView(generics.ListAPIView):
    queryset = Section.objects.select_related('course').all()
    serializer_class = SectionSerializer
    permission_classes = [IsAdminOrFaculty]
    filterset_fields = ['course', 'semester']


class ClassroomListView(generics.ListAPIView):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAdminOrFaculty]
