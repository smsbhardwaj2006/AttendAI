import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model. `role` drives which dashboard the frontend routes to
    and which endpoints are permitted (see apps.accounts.permissions).
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        FACULTY = 'faculty', 'Faculty'
        STUDENT = 'student', 'Student'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    phone_number = models.CharField(max_length=20, blank=True)
    is_active_profile = models.BooleanField(
        default=True, help_text='Soft-disable a user without deleting their record.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'
