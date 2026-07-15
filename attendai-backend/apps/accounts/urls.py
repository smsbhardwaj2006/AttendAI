from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import ChangePasswordView, LoginView, LogoutView, MeView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
