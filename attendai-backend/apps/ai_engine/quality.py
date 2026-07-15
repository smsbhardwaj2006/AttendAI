"""
Face quality validation — rejects attendance/enrollment samples that are
blurry, poorly lit, partially visible, or have excessive head rotation, per
the PRD's Face Quality Validation module.
"""
import io
from dataclasses import dataclass

import numpy as np
from django.conf import settings
from PIL import Image

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

BLUR_VARIANCE_THRESHOLD = 80.0  # Laplacian variance below this = too blurry
MIN_BRIGHTNESS = 40  # mean pixel intensity (0-255)
MAX_BRIGHTNESS = 235
MIN_FACE_AREA_RATIO = 0.08  # face bbox area / frame area


@dataclass
class QualityReport:
    passed: bool
    blur_score: float
    brightness: float
    face_area_ratio: float
    head_rotation_degrees: float
    reasons: list


def _laplacian_variance(gray: np.ndarray) -> float:
    if cv2 is not None:
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())
    # Fallback: simple gradient-magnitude variance without OpenCV.
    gy, gx = np.gradient(gray.astype(float))
    return float((gx**2 + gy**2).var())


def assess_quality(image_bytes: bytes, detection, max_rotation_degrees: int | None = None) -> QualityReport:
    max_rotation_degrees = max_rotation_degrees or settings.AI_MAX_HEAD_ROTATION_DEGREES

    img = np.array(Image.open(io.BytesIO(image_bytes)).convert('L'))
    frame_h, frame_w = img.shape[:2]

    blur_score = _laplacian_variance(img)
    brightness = float(img.mean())

    x, y, w, h = detection.bbox
    face_area_ratio = (w * h) / (frame_w * frame_h) if frame_w and frame_h else 0

    reasons = []
    if blur_score < BLUR_VARIANCE_THRESHOLD:
        reasons.append('Face is blurry')
    if brightness < MIN_BRIGHTNESS:
        reasons.append('Poor lighting — image too dark')
    elif brightness > MAX_BRIGHTNESS:
        reasons.append('Poor lighting — image overexposed')
    if face_area_ratio < MIN_FACE_AREA_RATIO:
        reasons.append('Face is partially visible or too far from camera')
    if abs(detection.head_rotation_degrees) > max_rotation_degrees:
        reasons.append('Excessive head rotation')

    if not settings.AI_QUALITY_CHECK_ENABLED:
        reasons = []

    return QualityReport(
        passed=len(reasons) == 0,
        blur_score=round(blur_score, 1),
        brightness=round(brightness, 1),
        face_area_ratio=round(face_area_ratio, 3),
        head_rotation_degrees=detection.head_rotation_degrees,
        reasons=reasons,
    )
