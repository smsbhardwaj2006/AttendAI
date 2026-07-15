from django.contrib import admin

from apps.students.models import FaceEmbedding, Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['roll_no', 'user', 'course', 'section', 'face_enrollment_status']
    list_filter = ['course', 'section', 'face_enrollment_status']
    search_fields = ['roll_no', 'user__first_name', 'user__last_name']


@admin.register(FaceEmbedding)
class FaceEmbeddingAdmin(admin.ModelAdmin):
    list_display = ['student', 'pose_label', 'quality_score', 'is_active', 'created_at']
    list_filter = ['is_active', 'pose_label']
