from django.contrib import admin

from apps.core.models import ActivityLog, AISettings


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'actor', 'action', 'target']
    list_filter = ['action']
    search_fields = ['target', 'actor__email']
    readonly_fields = [f.name for f in ActivityLog._meta.fields]


@admin.register(AISettings)
class AISettingsAdmin(admin.ModelAdmin):
    list_display = ['confidence_threshold', 'anti_spoofing_enabled', 'quality_check_enabled', 'updated_at']
