from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import random

from .models import Customer, Order
from .serializers import CustomerSerializer, OrderSerializer


class CustomerListView(generics.ListAPIView):
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer


class CustomerDetailView(generics.RetrieveAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class OrderListView(generics.ListAPIView):
    queryset = Order.objects.select_related("customer").all().order_by("-order_date")
    serializer_class = OrderSerializer


@api_view(["POST"])
def seed_customers(request):
    Customer.objects.all().delete()

    names = ["Aarav Sharma", "Isha Verma", "Rohan Mehta", "Ananya Singh", "Kabir Gupta"]
    cities = ["Delhi", "Mumbai", "Bangalore", "Pune", "Jaipur"]
    channels = ["whatsapp", "sms", "email", "rcs"]
    genders = ["male", "female", "other"]

    customers = []

    for i in range(100):
        customer = Customer.objects.create(
            name=f"{random.choice(names)} {i+1}",
            email=f"customer{i+1}@example.com",
            phone=f"900000{i+1:04d}",
            city=random.choice(cities),
            age=random.randint(18, 55),
            gender=random.choice(genders),
            preferred_channel=random.choice(channels),
        )
        customers.append(customer)

    return Response(
        {"message": "Customers seeded successfully", "count": len(customers)},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def seed_orders(request):
    Order.objects.all().delete()

    customers = list(Customer.objects.all())

    if not customers:
        return Response(
            {"error": "Seed customers first"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    categories = ["Coffee", "Skincare", "Fashion", "Footwear", "Electronics"]
    orders = []

    for customer in customers:
        for _ in range(random.randint(1, 5)):
            order = Order.objects.create(
                customer=customer,
                product_category=random.choice(categories),
                amount=random.randint(500, 12000),
                order_date=timezone.now() - timedelta(days=random.randint(1, 180)),
            )
            orders.append(order)

    return Response(
        {"message": "Orders seeded successfully", "count": len(orders)},
        status=status.HTTP_201_CREATED,
    )