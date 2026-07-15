import uuid

from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    """System-wide audit trail — surfaced on the Admin > Activity Logs
    screen. Created explicitly at each meaningful action (login, session
    start, manual correction, settings change, spoof detection, etc.)
    rather than generically at the middleware level, so entries stay
    human-readable."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs'
    )
    action = models.CharField(max_length=100)
    target = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        actor_label = self.actor.email if self.actor else 'System'
        return f'{actor_label} · {self.action} · {self.target}'


class AISettings(models.Model):
    """
    Singleton row holding the tunable AI recognition parameters exposed on
    the Admin > AI Settings screen. Falls back to the Django settings
    defaults (AI_CONFIDENCE_THRESHOLD etc.) if no row exists yet.
    """

    confidence_threshold = models.PositiveSmallIntegerField(default=94)
    max_head_rotation_degrees = models.PositiveSmallIntegerField(default=20)
    anti_spoofing_enabled = models.BooleanField(default=True)
    quality_check_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )

    class Meta:
        db_table = 'ai_settings'

    def __str__(self):
        return 'AI Recognition Settings'

    @classmethod
    def current(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
