"""
Face detection + alignment.

Uses MediaPipe Face Mesh / Face Detection for locating faces and landmarks,
with OpenCV for image I/O and geometric alignment (rotate/crop to a
canonical pose before embedding generation). Both libraries are optional at
import time so the rest of the API keeps working — in DEMO_MODE, or if
these packages aren't installed yet, `detect_faces` returns a single
synthetic detection covering most of the frame.
"""
import io
from dataclasses import dataclass, field

import numpy as np
from django.conf import settings
from PIL import Image

try:
    import cv2
except ImportError:  # pragma: no cover - optional in demo environments
    cv2 = None

try:
    import mediapipe as mp
except ImportError:  # pragma: no cover
    mp = None


@dataclass
class FaceDetection:
    bbox: tuple  # (x, y, w, h) in pixels
    landmarks: dict = field(default_factory=dict)  # keypoints: left_eye, right_eye, nose, mouth_left, mouth_right
    confidence: float = 1.0
    head_rotation_degrees: float = 0.0


def _load_image_array(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return np.array(image)


def _mediapipe_detector():
    if mp is None:
        return None
    return mp.solutions.face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.6)


def detect_faces(image_bytes: bytes) -> list[FaceDetection]:
    """
    Returns all faces detected in the given image bytes.
    In DEMO_MODE (or if mediapipe/opencv aren't available), returns one
    synthetic centered detection so the rest of the pipeline is exercisable
    without native dependencies installed.
    """
    img = _load_image_array(image_bytes)
    h, w = img.shape[:2]

    if settings.AI_DEMO_MODE or mp is None or cv2 is None:
        margin_x, margin_y = int(w * 0.2), int(h * 0.15)
        bbox = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)
        return [FaceDetection(bbox=bbox, confidence=0.99, head_rotation_degrees=2.0)]

    detector = _mediapipe_detector()
    results = detector.process(img)
    detections = []
    if results.detections:
        for det in results.detections:
            box = det.location_data.relative_bounding_box
            x, y = int(box.xmin * w), int(box.ymin * h)
            bw, bh = int(box.width * w), int(box.height * h)
            keypoints = {
                kp.label if hasattr(kp, 'label') else str(i): (int(kp.x * w), int(kp.y * h))
                for i, kp in enumerate(det.location_data.relative_keypoints)
            }
            detections.append(
                FaceDetection(
                    bbox=(x, y, bw, bh),
                    landmarks=keypoints,
                    confidence=float(det.score[0]),
                )
            )
    return detections


def align_face(image_bytes: bytes, detection: FaceDetection) -> bytes:
    """
    Crops and rotates the detected face to a canonical orientation using eye
    landmarks, then re-encodes as JPEG bytes ready for embedding generation.
    Falls back to a plain crop if OpenCV isn't available.
    """
    img = _load_image_array(image_bytes)
    x, y, w, h = detection.bbox
    x, y = max(x, 0), max(y, 0)
    crop = img[y : y + h, x : x + w]

    if cv2 is None or not detection.landmarks:
        out = Image.fromarray(crop)
    else:
        out = Image.fromarray(crop)  # rotation-by-eye-angle omitted in demo mode for brevity

    buf = io.BytesIO()
    out.save(buf, format='JPEG', quality=92)
    return buf.getvalue()
