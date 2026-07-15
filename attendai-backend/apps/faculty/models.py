import uuid

from django.conf import settings
from django.db import models


class FacultyProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey('academics.Department', on_delete=models.PROTECT, related_name='faculty_members')
    subjects = models.ManyToManyField('academics.Subject', related_name='faculty_members', blank=True)
    classrooms = models.ManyToManyField('academics.Classroom', related_name='assigned_faculty', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'faculty'
        ordering = ['employee_id']

    def __str__(self):
        return f'{self.employee_id} — {self.user.get_full_name()}'
