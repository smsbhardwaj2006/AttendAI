import uuid

from django.conf import settings
from django.db import models


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    roll_no = models.CharField(max_length=20, unique=True)
    course = models.ForeignKey('academics.Course', on_delete=models.PROTECT, related_name='students')
    section = models.ForeignKey('academics.Section', on_delete=models.PROTECT, related_name='students')
    admission_year = models.PositiveSmallIntegerField()
    date_of_birth = models.DateField(null=True, blank=True)

    class EnrollmentStatus(models.TextChoices):
        NOT_ENROLLED = 'not_enrolled', 'Not Enrolled'
        PENDING = 'pending', 'Pending Review'
        ENROLLED = 'enrolled', 'Enrolled'
        REJECTED = 'rejected', 'Rejected'

    face_enrollment_status = models.CharField(
        max_length=15, choices=EnrollmentStatus.choices, default=EnrollmentStatus.NOT_ENROLLED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['roll_no']

    def __str__(self):
        return f'{self.roll_no} — {self.user.get_full_name()}'

    @property
    def department(self):
        return self.course.department


class FaceEmbedding(models.Model):
    """
    One row per enrolled face sample. `vector` stores the embedding produced
    by the InsightFace model (see apps.ai_engine.face_recognition) as a JSON
    array of floats — PostgreSQL has no native vector type without the
    pgvector extension, so this uses a portable JSONField by default.
    If pgvector is installed, swap this for VectorField(dimensions=512) and
    add an ANN index for faster similarity search at scale.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='face_embeddings')
    vector = models.JSONField(help_text='512-d float embedding from the recognition model.')
    sample_image = models.ImageField(upload_to='face_samples/%Y/%m/')
    quality_score = models.FloatField(default=0.0)
    pose_label = models.CharField(max_length=30, blank=True)  # e.g. "frontal", "left", "right"
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'face_embeddings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Embedding for {self.student.roll_no} ({self.pose_label})'
