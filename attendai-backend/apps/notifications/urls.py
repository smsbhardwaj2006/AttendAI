from django.urls import path

from apps.notifications.views import MarkAllReadView, NotificationListView, NotificationUpdateView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),
    path('<uuid:pk>/', NotificationUpdateView.as_view(), name='notification_update'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark_all_read'),
]
