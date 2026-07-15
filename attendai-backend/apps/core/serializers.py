from rest_framework import serializers

from apps.core.models import ActivityLog, AISettings


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'actor_name', 'action', 'target', 'metadata', 'created_at']

    def get_actor_name(self, obj):
        if not obj.actor:
            return 'System'
        return obj.actor.get_full_name() or obj.actor.email


class AISettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AISettings
        fields = [
            'confidence_threshold',
            'max_head_rotation_degrees',
            'anti_spoofing_enabled',
            'quality_check_enabled',
            'updated_at',
        ]
