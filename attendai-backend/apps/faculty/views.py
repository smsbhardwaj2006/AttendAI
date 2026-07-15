from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsAdminOrFaculty
from apps.core.models import ActivityLog
from apps.faculty.models import FacultyProfile
from apps.faculty.serializers import (
    AssignSubjectsSerializer,
    FacultyCreateSerializer,
    FacultySerializer,
)


class FacultyListCreateView(generics.ListCreateAPIView):
    queryset = FacultyProfile.objects.select_related('user', 'department').prefetch_related('subjects').all()
    filterset_fields = ['department']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrFaculty()]

    def get_serializer_class(self):
        return FacultyCreateSerializer if self.request.method == 'POST' else FacultySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        faculty = serializer.save()
        ActivityLog.objects.create(actor=request.user, action='faculty_created', target=faculty.employee_id)
        return Response(FacultySerializer(faculty).data, status=status.HTTP_201_CREATED)


class FacultyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FacultyProfile.objects.select_related('user', 'department').all()
    serializer_class = FacultySerializer
    permission_classes = [IsAdmin]


class AssignSubjectsView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        faculty = FacultyProfile.objects.get(pk=pk)
        serializer = AssignSubjectsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        faculty.subjects.set(serializer.validated_data['subjects'])
        ActivityLog.objects.create(actor=request.user, action='faculty_subjects_assigned', target=faculty.employee_id)
        return Response(FacultySerializer(faculty).data)
