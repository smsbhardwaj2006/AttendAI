import uuid

from django.db import models


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'departments'
        ordering = ['name']

    def __str__(self):
        return self.name


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20)
    duration_years = models.PositiveSmallIntegerField(default=4)

    class Meta:
        db_table = 'courses'
        unique_together = ('department', 'code')
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.department.code})'


class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20)
    semester = models.PositiveSmallIntegerField()
    credits = models.PositiveSmallIntegerField(default=3)

    class Meta:
        db_table = 'subjects'
        unique_together = ('course', 'code')
        ordering = ['semester', 'name']

    def __str__(self):
        return f'{self.name} (Sem {self.semester})'


class Section(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=10)  # e.g. "A", "B"
    semester = models.PositiveSmallIntegerField()

    class Meta:
        db_table = 'sections'
        unique_together = ('course', 'name', 'semester')
        ordering = ['name']

    def __str__(self):
        return f'{self.course.code}-{self.name}'


class Classroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)  # e.g. "Room 204"
    building = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveSmallIntegerField(default=60)
    camera_id = models.CharField(
        max_length=100, blank=True, help_text='Identifier of the attendance camera installed in this room.'
    )

    class Meta:
        db_table = 'classrooms'
        ordering = ['name']

    def __str__(self):
        return self.name
