"""
Lightweight middleware reserved for request-scoped concerns (e.g. attaching
request metadata for exception logging). Deliberately does NOT auto-log
every request to `ActivityLog` — activity log entries are created
explicitly at meaningful action points (see apps.accounts.views,
apps.attendance.views, etc.) so the audit trail stays readable instead of
being flooded with every GET request.
"""


class ActivityLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response
