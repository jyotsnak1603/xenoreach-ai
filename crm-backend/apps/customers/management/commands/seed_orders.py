from django.core.management.base import BaseCommand
from apps.customers.models import Customer, Order
from django.utils import timezone
from datetime import timedelta
import random

class Command(BaseCommand):
    help = "Seed orders"

    def handle(self, *args, **kwargs):
        categories = [
            "Electronics",
            "Fashion",
            "Coffee",
            "Skincare",
            "Books",
        ]

        created = 0

        for customer in Customer.objects.all():

            order_count = random.randint(1, 8)

            for _ in range(order_count):
                Order.objects.create(
                    customer=customer,
                    product_category=random.choice(categories),
                    amount=random.randint(500, 10000),
                    order_date=timezone.now() - timedelta(days=random.randint(1, 180))
                )

                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created} orders"
            )
        )