"""
Orchestrates the end-to-end AI workflow described in the PRD:
  detect -> align -> quality-check -> anti-spoof -> embed -> compare -> score

Used by:
  - apps.students views: face enrollment (build a student's embedding gallery)
  - apps.attendance views: live recognition (match a frame against a
    session's enrolled students and mark attendance)
"""
from dataclasses import dataclass
from django.conf import settings

from apps.ai_engine import anti_spoofing, face_detection, face_recognition, quality
from apps.ai_engine.exceptions import (
    LowConfidenceMatchError,
    MultipleFacesError,
    NoFaceDetectedError,
    NoMatchFoundError,
    PoorQualityError,
    SpoofDetectedError,
)


@dataclass
class EnrollmentSampleResult:
    embedding: list
    quality_score: float
    pose_label: str = 'frontal'


@dataclass
class RecognitionResult:
    student_id: str
    confidence: float
    is_match: bool
    liveness_score: float


def process_enrollment_sample(image_bytes: bytes, allow_multi_face: bool = False) -> EnrollmentSampleResult:
    """Runs one captured enrollment photo through detection, quality, and
    embedding generation. Raises an AIEngineError subclass on failure."""
    detections = face_detection.detect_faces(image_bytes)
    if not detections:
        raise NoFaceDetectedError('No face detected in the captured sample. Try again with better lighting.')
    if len(detections) > 1 and not allow_multi_face:
        raise MultipleFacesError('Multiple faces detected — make sure only you are in frame.')

    detection = detections[0]
    report = quality.assess_quality(image_bytes, detection)
    if not report.passed:
        raise PoorQualityError('; '.join(report.reasons) or 'Sample failed quality validation.')

    aligned = face_detection.align_face(image_bytes, detection)
    embedding = face_recognition.generate_embedding(aligned)

    # Overall sample quality score (0-100) shown to the reviewer / stored
    # alongside the embedding for later auditing.
    quality_score = round(
        max(0, 100 - (report.head_rotation_degrees) - max(0, 80 - report.blur_score) / 2), 1
    )

    return EnrollmentSampleResult(embedding=embedding, quality_score=quality_score)


def recognize_frame(image_bytes: bytes, candidates: list[tuple], confidence_threshold: int | None = None) -> RecognitionResult:
    """
    candidates: [(student_id, embedding_vector), ...] — the gallery of
    students enrolled in the session's section/subject.
    Runs the live-attendance workflow (PRD steps 3-9) for a single frame:
    detect -> align -> anti-spoof -> embed -> compare -> confidence score.
    """
    confidence_threshold = confidence_threshold or settings.AI_CONFIDENCE_THRESHOLD

    detections = face_detection.detect_faces(image_bytes)
    if not detections:
        raise NoFaceDetectedError('No face detected in frame.')

    detection = detections[0]

    liveness = anti_spoofing.check_liveness(image_bytes, detection)
    if not liveness.is_live:
        raise SpoofDetectedError(liveness.reason or 'Spoof attempt detected.')

    aligned = face_detection.align_face(image_bytes, detection)
    embedding = face_recognition.generate_embedding(aligned)

    best_match = face_recognition.find_best_match(embedding, candidates)
    if best_match is None:
        raise NoMatchFoundError('No enrolled students available to match against.')

    student_id, confidence = best_match
    if confidence < confidence_threshold:
        raise LowConfidenceMatchError(
            f'Best match confidence {confidence}% is below the {confidence_threshold}% threshold.',
            candidate_student_id=student_id,
            confidence=confidence,
        )

    return RecognitionResult(
        student_id=student_id, confidence=confidence, is_match=True, liveness_score=liveness.liveness_score
    )
