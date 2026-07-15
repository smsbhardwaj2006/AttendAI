from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    filterset_fields = ['read', 'type']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationUpdateView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkAllReadView(APIView):
    def post(self, request):
        updated = Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'marked_read': updated})
