from django.urls import path

from apps.attendance.views import (
    AttendanceSessionDetailView,
    AttendanceSessionListCreateView,
    DailySummaryView,
    EndSessionView,
    HeatmapView,
    ManualAttendanceUpdateView,
    MonthlySummaryView,
    RecognizeFrameView,
    SessionRecordsView,
    SubjectWiseSummaryView,
    UnknownFaceLogListView,
    VerificationQueueView,
)

urlpatterns = [
    path('sessions/', AttendanceSessionListCreateView.as_view(), name='sessions'),
    path('sessions/<uuid:pk>/', AttendanceSessionDetailView.as_view(), name='session_detail'),
    path('sessions/<uuid:pk>/end/', EndSessionView.as_view(), name='session_end'),
    path('sessions/<uuid:pk>/recognize/', RecognizeFrameView.as_view(), name='session_recognize'),
    path('sessions/<uuid:pk>/records/', SessionRecordsView.as_view(), name='session_records'),
    path('sessions/<uuid:pk>/verification-queue/', VerificationQueueView.as_view(), name='verification_queue'),
    path('records/<uuid:pk>/', ManualAttendanceUpdateView.as_view(), name='record_update'),
    path('summary/daily/', DailySummaryView.as_view(), name='summary_daily'),
    path('summary/monthly/', MonthlySummaryView.as_view(), name='summary_monthly'),
    path('summary/subject-wise/', SubjectWiseSummaryView.as_view(), name='summary_subject_wise'),
    path('summary/heatmap/', HeatmapView.as_view(), name='summary_heatmap'),
    path('unknown-faces/', UnknownFaceLogListView.as_view(), name='unknown_faces'),
]
