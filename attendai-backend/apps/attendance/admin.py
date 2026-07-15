from django.contrib import admin

from apps.attendance.models import AttendanceRecord, AttendanceSession, UnknownFaceLog


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['subject', 'section', 'classroom', 'faculty', 'status', 'started_at', 'ended_at']
    list_filter = ['status', 'subject']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'session', 'status', 'confidence', 'method', 'marked_at']
    list_filter = ['status', 'method']
    search_fields = ['student__roll_no']


@admin.register(UnknownFaceLog)
class UnknownFaceLogAdmin(admin.ModelAdmin):
    list_display = ['reason', 'classroom', 'confidence', 'resolved', 'created_at']
    list_filter = ['reason', 'resolved']
