from django.contrib import admin

from apps.faculty.models import FacultyProfile


@admin.register(FacultyProfile)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'user', 'department']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name']
    filter_horizontal = ['subjects', 'classrooms']
