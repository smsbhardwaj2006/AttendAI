"""
Seeds the database with a small but complete demo dataset — departments,
courses, subjects, sections, classrooms, an admin, faculty, and students —
so the frontend can be reviewed against a real backend immediately after
setup. Run with:

    python manage.py seed_demo_data
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academics.models import Classroom, Course, Department, Section, Subject
from apps.accounts.models import User
from apps.faculty.models import FacultyProfile
from apps.students.models import Student

DEMO_PASSWORD = 'AttendAI@2026'


class Command(BaseCommand):
    help = 'Seed the database with demo departments, courses, faculty, and students.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding AttendAI demo data...')

        admin_user, created = User.objects.get_or_create(
            email='admin@attendai.edu',
            defaults=dict(username='admin', first_name='System', last_name='Admin', role=User.Role.ADMIN, is_staff=True, is_superuser=True),
        )
        if created:
            admin_user.set_password(DEMO_PASSWORD)
            admin_user.save()

        cse, _ = Department.objects.get_or_create(name='Computer Science & Engineering', code='CSE')
        aiml, _ = Department.objects.get_or_create(name='Artificial Intelligence & ML', code='AIML')

        btech_cse, _ = Course.objects.get_or_create(department=cse, code='BT-CSE', defaults={'name': 'B.Tech Computer Science', 'duration_years': 4})
        btech_aiml, _ = Course.objects.get_or_create(department=aiml, code='BT-AIML', defaults={'name': 'B.Tech AI & ML', 'duration_years': 4})

        ds, _ = Subject.objects.get_or_create(course=btech_cse, code='CS301', defaults={'name': 'Data Structures', 'semester': 3, 'credits': 4})
        dbms, _ = Subject.objects.get_or_create(course=btech_cse, code='CS302', defaults={'name': 'Database Management', 'semester': 3, 'credits': 4})
        os_subj, _ = Subject.objects.get_or_create(course=btech_cse, code='CS401', defaults={'name': 'Operating Systems', 'semester': 4, 'credits': 4})
        ml, _ = Subject.objects.get_or_create(course=btech_aiml, code='AI301', defaults={'name': 'Machine Learning', 'semester': 3, 'credits': 4})

        section_a, _ = Section.objects.get_or_create(course=btech_cse, name='A', semester=3)
        section_b, _ = Section.objects.get_or_create(course=btech_cse, name='B', semester=3)

        room_204, _ = Classroom.objects.get_or_create(name='Room 204', defaults={'building': 'Block A', 'capacity': 65})
        room_118, _ = Classroom.objects.get_or_create(name='Room 118', defaults={'building': 'Block A', 'capacity': 60})
        room_302, _ = Classroom.objects.get_or_create(name='Room 302', defaults={'building': 'Block B', 'capacity': 70})

        faculty_user, created = User.objects.get_or_create(
            email='kavita.nair@attendai.edu',
            defaults=dict(username='FAC-1042', first_name='Kavita', last_name='Nair', role=User.Role.FACULTY),
        )
        if created:
            faculty_user.set_password(DEMO_PASSWORD)
            faculty_user.save()
        faculty_profile, _ = FacultyProfile.objects.get_or_create(
            user=faculty_user, defaults={'employee_id': 'FAC-1042', 'department': cse}
        )
        faculty_profile.subjects.set([ds, dbms])
        faculty_profile.classrooms.set([room_204, room_118])

        demo_students = [
            ('Aarav', 'Sharma', 'CS21B045', section_a),
            ('Diya', 'Patel', 'CS21B012', section_a),
            ('Rohan', 'Mehta', 'CS21B078', section_b),
            ('Sneha', 'Iyer', 'CS21B033', section_b),
        ]
        for first, last, roll_no, section in demo_students:
            email = f'{first.lower()}.{last.lower()}@attendai.edu'
            user, created = User.objects.get_or_create(
                email=email, defaults=dict(username=roll_no, first_name=first, last_name=last, role=User.Role.STUDENT)
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            Student.objects.get_or_create(
                user=user, defaults={'roll_no': roll_no, 'course': btech_cse, 'section': section, 'admission_year': 2021}
            )

        self.stdout.write(self.style.SUCCESS('Done. Demo login: admin@attendai.edu / kavita.nair@attendai.edu / aarav.sharma@attendai.edu'))
        self.stdout.write(self.style.SUCCESS(f'Password for all demo accounts: {DEMO_PASSWORD}'))
