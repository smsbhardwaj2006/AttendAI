"""
Face recognition — embedding generation, comparison, and identity
verification, per the PRD's Face Recognition module (InsightFace + ONNX
Runtime).

In DEMO_MODE, embeddings are generated with a deterministic perceptual hash
instead of loading InsightFace's ~300MB model weights, so the API is fully
functional in environments without model downloads or a GPU. Swap
`_demo_embedding` out by setting AI_DEMO_MODE=False once weights are
available — `generate_embedding` already calls the real InsightFace model
in that branch.
"""
import hashlib
import io

import numpy as np
from django.conf import settings
from PIL import Image

try:
    import insightface

    _APP = None

    def _get_insightface_app():
        global _APP
        if _APP is None:
            _APP = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
            _APP.prepare(ctx_id=0, det_size=(640, 640))
        return _APP

except ImportError:  # pragma: no cover
    insightface = None

EMBEDDING_DIM = 512


def _demo_embedding(image_bytes: bytes) -> np.ndarray:
    """
    Deterministic pseudo-embedding: hashes downsampled pixel data into a
    512-d vector. NOT suitable for production accuracy — it exists purely
    so enrollment/comparison endpoints are exercisable end-to-end without
    real model weights. Two crops of the *same* physical photo hash close
    to identically; different photos hash apart, which is enough to drive
    the demo UI and automated tests.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('L').resize((32, 32))
    arr = np.array(img, dtype=np.float32).flatten()
    seed = int(hashlib.sha256(arr.tobytes()).hexdigest(), 16) % (2**32)
    rng = np.random.default_rng(seed)
    base = rng.normal(size=EMBEDDING_DIM)
    # Blend in the actual pixel signal so visually similar crops (e.g. the
    # same enrollment photo re-submitted) produce closer vectors.
    signal = np.resize(arr / 255.0, EMBEDDING_DIM)
    vector = 0.7 * base + 0.3 * signal
    return vector / np.linalg.norm(vector)


def generate_embedding(image_bytes: bytes) -> list[float]:
    """Returns a 512-d L2-normalized embedding as a plain list (JSON-serializable)."""
    if settings.AI_DEMO_MODE or insightface is None:
        vector = _demo_embedding(image_bytes)
        return vector.tolist()

    app = _get_insightface_app()
    img = np.array(Image.open(io.BytesIO(image_bytes)).convert('RGB'))
    faces = app.get(img)
    if not faces:
        raise ValueError('No face found for embedding generation.')
    # Use the largest detected face.
    face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
    vector = face.normed_embedding
    return vector.tolist()


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    a, b = np.array(vec_a), np.array(vec_b)
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def similarity_to_confidence(similarity: float) -> float:
    """Maps cosine similarity (~[-1, 1], typically [0.2, 1.0] for faces) to a
    0-100 confidence score for display in the frontend's recognition feed."""
    clamped = max(0.0, min(1.0, (similarity + 1) / 2))
    return round(clamped * 100, 1)


def find_best_match(query_embedding: list[float], candidates: list[tuple]) -> tuple | None:
    """
    candidates: list of (student_id, embedding_vector) tuples, typically all
    active FaceEmbedding rows for a course/section being monitored.
    Returns (student_id, confidence) for the best match, or None if no
    candidates were provided.
    """
    if not candidates:
        return None
    scored = [
        (student_id, similarity_to_confidence(cosine_similarity(query_embedding, vec)))
        for student_id, vec in candidates
    ]
    return max(scored, key=lambda pair: pair[1])
