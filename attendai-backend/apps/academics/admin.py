from django.contrib import admin

from apps.academics.models import Classroom, Course, Department, Section, Subject

admin.site.register(Department)
admin.site.register(Course)
admin.site.register(Subject)
admin.site.register(Section)
admin.site.register(Classroom)
