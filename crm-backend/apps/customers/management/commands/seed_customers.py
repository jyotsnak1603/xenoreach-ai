from django.core.management.base import BaseCommand
from apps.customers.models import Customer
import random

class Command(BaseCommand):
    help = "Seed customers"

    def handle(self, *args, **kwargs):
        cities = ["Delhi", "Mumbai", "Bangalore", "Jaipur", "Pune"]

        channels = [
            "whatsapp",
            "sms",
            "email",
            "rcs",
        ]

        genders = [
            "male",
            "female",
            "other",
        ]

        created = 0

        for i in range(1, 101):
            email = f"customer{i}@example.com"

            if Customer.objects.filter(email=email).exists():
                continue

            Customer.objects.create(
                name=f"Customer {i}",
                email=email,
                phone=f"900000{i:03d}",
                city=random.choice(cities),
                age=random.randint(18, 60),
                gender=random.choice(genders),
                preferred_channel=random.choice(channels),
            )

            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created} customers"
            )
        )