from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import ChangePasswordSerializer, LoginSerializer, UserSerializer
from apps.core.models import ActivityLog


class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates by email + password, returns {access, refresh, user}.
    The frontend's AuthContext stores access/refresh and routes by user.role.
    """

    permission_classes = [AllowAny]
    throttle_scope = 'login'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if user is None or not user.is_active_profile:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role

        ActivityLog.objects.create(
            actor=user, action='login', target=user.email, metadata={'ip': request.META.get('REMOTE_ADDR')}
        )

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklists the given refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass
        ActivityLog.objects.create(actor=request.user, action='logout', target=request.user.email)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    """GET /api/auth/me/ — used by the frontend to restore a session on page load."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'detail': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        ActivityLog.objects.create(actor=user, action='password_change', target=user.email)
        return Response({'detail': 'Password updated successfully.'})
