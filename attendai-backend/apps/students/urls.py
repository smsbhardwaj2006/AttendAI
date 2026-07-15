from django.urls import path

from apps.students.views import (
    FaceEnrollmentStatusView,
    FaceEnrollmentView,
    StudentAttendanceHistoryView,
    StudentDetailView,
    StudentListCreateView,
)

urlpatterns = [
    path('', StudentListCreateView.as_view(), name='students'),
    path('<uuid:pk>/', StudentDetailView.as_view(), name='student_detail'),
    path('<uuid:pk>/attendance/', StudentAttendanceHistoryView.as_view(), name='student_attendance'),
    path('<uuid:pk>/face-enrollment/', FaceEnrollmentView.as_view(), name='face_enrollment'),
    path('<uuid:pk>/face-enrollment/status/', FaceEnrollmentStatusView.as_view(), name='face_enrollment_status'),
]
