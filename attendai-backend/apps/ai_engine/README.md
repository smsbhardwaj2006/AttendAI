# AI Engine

Implements the PRD's AI modules: face detection, quality validation,
anti-spoofing, and face recognition, wired together in `pipeline.py`.

## Demo mode vs. production mode

Set via `AI_DEMO_MODE` in `.env` (default `True`).

| | Demo mode | Production mode |
|---|---|---|
| Face detection | Single synthetic centered bounding box | MediaPipe Face Detection |
| Quality validation | Same real checks (blur/brightness/rotation) run either way | Same |
| Anti-spoofing | Always returns "live" | Frequency + color-texture heuristic, or your trained liveness model |
| Embeddings | Deterministic pseudo-embedding (pixel hash) | InsightFace `buffalo_l` via ONNX Runtime |

Demo mode exists so the full API surface — enrollment, live recognition,
manual verification — is testable and demoable without downloading ~300MB
of model weights or needing a GPU. **Flip `AI_DEMO_MODE=False` once you've
installed real weights** (see below); no other code changes are required,
since every call site goes through the same functions.

## Moving to production

1. `pip install insightface onnxruntime mediapipe opencv-python-headless`
   (already in `requirements.txt`).
2. On first run with `AI_DEMO_MODE=False`, `insightface.app.FaceAnalysis`
   will download the `buffalo_l` model pack automatically (needs internet
   access once). To pre-bundle weights for an offline deployment, download
   them ahead of time and point `INSIGHTFACE_HOME` at a local directory.
3. For stronger anti-spoofing than the built-in heuristic, swap
   `anti_spoofing._heuristic_liveness_score` for a trained liveness model
   (e.g. Silent-Face-Anti-Spoofing, exported to ONNX) loaded via
   `onnxruntime.InferenceSession` — keep the same `LivenessResult` return
   shape so `pipeline.py` doesn't need to change.
4. Recalibrate `AI_CONFIDENCE_THRESHOLD` and `AI_MAX_HEAD_ROTATION_DEGREES`
   against your own classroom lighting/camera setup — the Admin > AI
   Settings screen in the frontend writes these to `apps.core.models.AISettings`
   at runtime.

## Where each PRD module lives

- **Face Enrollment** → `apps.students` views call `pipeline.process_enrollment_sample`
- **Face Detection** → `face_detection.py`
- **Face Recognition** → `face_recognition.py`
- **Anti-Spoofing** → `anti_spoofing.py`
- **Face Quality Validation** → `quality.py`
- **Attendance Workflow** (steps 1-11 in the PRD) → `pipeline.recognize_frame`,
  called from `apps.attendance.views.RecognizeFrameView`
