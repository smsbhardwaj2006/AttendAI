from rest_framework.permissions import BasePermission

from apps.accounts.models import User


class IsAdmin(BasePermission):
    message = 'This action requires an admin account.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsFaculty(BasePermission):
    message = 'This action requires a faculty account.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.FACULTY)


class IsStudent(BasePermission):
    message = 'This action requires a student account.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.STUDENT)


class IsAdminOrFaculty(BasePermission):
    message = 'This action requires an admin or faculty account.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.ADMIN, User.Role.FACULTY)
        )


class IsSelfOrAdmin(BasePermission):
    """Allows a user to access/modify only their own resource, unless they're an admin."""

    message = "You don't have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Role.ADMIN:
            return True
        owner = getattr(obj, 'user', obj)
        return owner == request.user
