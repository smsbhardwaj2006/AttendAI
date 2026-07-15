from django.urls import path

from apps.core.views import ActivityLogListView, AISettingsView, SystemStatsView

urlpatterns = [
    path('activity-logs/', ActivityLogListView.as_view(), name='activity_logs'),
    path('ai-settings/', AISettingsView.as_view(), name='ai_settings'),
    path('stats/', SystemStatsView.as_view(), name='system_stats'),
]
