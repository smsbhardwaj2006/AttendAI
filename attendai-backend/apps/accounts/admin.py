from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ['email', 'username', 'role', 'is_active_profile', 'is_staff']
    list_filter = ['role', 'is_active_profile', 'is_staff']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AttendAI profile', {'fields': ('role', 'phone_number', 'is_active_profile')}),
    )
