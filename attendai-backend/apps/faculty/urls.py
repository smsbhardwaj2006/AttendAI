from django.urls import path

from apps.faculty.views import AssignSubjectsView, FacultyDetailView, FacultyListCreateView

urlpatterns = [
    path('', FacultyListCreateView.as_view(), name='faculty_list'),
    path('<uuid:pk>/', FacultyDetailView.as_view(), name='faculty_detail'),
    path('<uuid:pk>/subjects/', AssignSubjectsView.as_view(), name='faculty_assign_subjects'),
]
