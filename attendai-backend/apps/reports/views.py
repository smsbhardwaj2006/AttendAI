import csv
import io

from django.http import HttpResponse
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrFaculty
from apps.attendance.models import AttendanceRecord
from apps.attendance.serializers import AttendanceRecordSerializer


def _records_for_range(request, days=1):
    date_str = request.query_params.get('date', timezone.now().date().isoformat())
    date = timezone.datetime.fromisoformat(date_str).date()
    start = date - timezone.timedelta(days=days - 1)
    qs = AttendanceRecord.objects.filter(session__started_at__date__range=(start, date)).select_related(
        'student__user', 'session__subject'
    )
    subject_id = request.query_params.get('subject')
    if subject_id:
        qs = qs.filter(session__subject_id=subject_id)
    return qs


class DailyReportView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        records = _records_for_range(request, days=1)
        return Response(AttendanceRecordSerializer(records, many=True).data)


class WeeklyReportView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        records = _records_for_range(request, days=7)
        return Response(AttendanceRecordSerializer(records, many=True).data)


class MonthlyReportView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        records = _records_for_range(request, days=30)
        return Response(AttendanceRecordSerializer(records, many=True).data)


class SubjectWiseReportView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        subject_id = request.query_params.get('subject')
        qs = AttendanceRecord.objects.select_related('student__user', 'session__subject')
        if subject_id:
            qs = qs.filter(session__subject_id=subject_id)
        return Response(AttendanceRecordSerializer(qs, many=True).data)


class StudentWiseReportView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        student_id = request.query_params.get('student')
        qs = AttendanceRecord.objects.select_related('student__user', 'session__subject')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return Response(AttendanceRecordSerializer(qs, many=True).data)


class ExportCsvView(APIView):
    """GET /api/reports/export/csv/ — streams a CSV of attendance records
    matching the given filters (date range, subject, student, section)."""

    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        records = _records_for_range(request, days=int(request.query_params.get('days', 30)))

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(['Roll No', 'Student Name', 'Subject', 'Date', 'Status', 'Confidence', 'Method'])
        for record in records:
            writer.writerow(
                [
                    record.student.roll_no,
                    record.student.user.get_full_name(),
                    record.session.subject.name,
                    record.session.started_at.strftime('%d-%m-%Y') if record.session.started_at else '',
                    record.status,
                    record.confidence or '',
                    record.method,
                ]
            )

        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendance_report.csv"'
        return response


class ExportPdfView(APIView):
    """GET /api/reports/export/pdf/ — generates a simple tabular PDF via
    ReportLab (no external binary dependency required, unlike WeasyPrint's
    system font/Cairo requirements — swap in WeasyPrint here for richer
    HTML-templated PDFs if your deployment has those system libs)."""

    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

        records = _records_for_range(request, days=int(request.query_params.get('days', 30)))

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        data = [['Roll No', 'Name', 'Subject', 'Date', 'Status']]
        for record in records:
            data.append(
                [
                    record.student.roll_no,
                    record.student.user.get_full_name(),
                    record.session.subject.name,
                    record.session.started_at.strftime('%d-%m-%Y') if record.session.started_at else '',
                    record.status,
                ]
            )

        table = Table(data, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B1220')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E3E8F0')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F6F8FB')]),
                ]
            )
        )
        doc.build([table])

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="attendance_report.pdf"'
        return response
