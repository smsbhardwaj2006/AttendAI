from django.urls import path

from apps.reports.views import (
    DailyReportView,
    ExportCsvView,
    ExportPdfView,
    MonthlyReportView,
    StudentWiseReportView,
    SubjectWiseReportView,
    WeeklyReportView,
)

urlpatterns = [
    path('daily/', DailyReportView.as_view(), name='report_daily'),
    path('weekly/', WeeklyReportView.as_view(), name='report_weekly'),
    path('monthly/', MonthlyReportView.as_view(), name='report_monthly'),
    path('subject-wise/', SubjectWiseReportView.as_view(), name='report_subject_wise'),
    path('student-wise/', StudentWiseReportView.as_view(), name='report_student_wise'),
    path('export/csv/', ExportCsvView.as_view(), name='report_export_csv'),
    path('export/pdf/', ExportPdfView.as_view(), name='report_export_pdf'),
]
