class AIEngineError(Exception):
    """Base class for all AI pipeline errors. Carries a `code` the API layer
    maps to a user-facing reason string (frontend shows this in toasts and
    the manual verification queue)."""

    code = 'ai_error'

    def __init__(self, message, code=None):
        super().__init__(message)
        self.message = message
        if code:
            self.code = code


class NoFaceDetectedError(AIEngineError):
    code = 'no_face_detected'


class MultipleFacesError(AIEngineError):
    code = 'multiple_faces_detected'


class PoorQualityError(AIEngineError):
    """Raised by apps.ai_engine.quality when a frame fails validation
    (blur, lighting, partial visibility, excessive head rotation)."""

    code = 'poor_quality'


class SpoofDetectedError(AIEngineError):
    code = 'spoof_detected'


class NoMatchFoundError(AIEngineError):
    code = 'no_match_found'


class LowConfidenceMatchError(AIEngineError):
    """Raised when the best match is below the configured confidence
    threshold — the caller should route this to manual verification
    rather than treating it as a hard failure."""

    code = 'low_confidence'

    def __init__(self, message, candidate_student_id=None, confidence=None, code=None):
        super().__init__(message, code)
        self.candidate_student_id = candidate_student_id
        self.confidence = confidence
