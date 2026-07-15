from django.urls import path

from apps.academics.views import (
    ClassroomListView,
    CourseListView,
    DepartmentListCreateView,
    SectionListView,
    SubjectListView,
)

urlpatterns = [
    path('departments/', DepartmentListCreateView.as_view(), name='departments'),
    path('courses/', CourseListView.as_view(), name='courses'),
    path('subjects/', SubjectListView.as_view(), name='subjects'),
    path('sections/', SectionListView.as_view(), name='sections'),
    path('classrooms/', ClassroomListView.as_view(), name='classrooms'),
]
