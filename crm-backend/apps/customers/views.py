from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import random

from .models import Customer, Order
from .serializers import CustomerSerializer, OrderSerializer


class CustomerListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer


class CustomerDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_timeline(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    from apps.communications.models import Communication

    # Orders with attribution
    orders = Order.objects.filter(customer=customer).order_by("-order_date").select_related("source_communication")
    orders_data = []
    for o in orders:
        orders_data.append({
            "id": o.id,
            "product_category": o.product_category,
            "amount": float(o.amount),
            "order_date": o.order_date,
            "from_campaign": o.source_communication is not None,
            "campaign_name": o.source_communication.campaign.name if o.source_communication else None,
        })

    # Communications timeline
    comms = Communication.objects.filter(customer=customer).order_by("-created_at").select_related("campaign")
    comms_data = []
    for c in comms:
        comms_data.append({
            "id": c.id,
            "campaign_name": c.campaign.name,
            "channel": c.channel,
            "current_status": c.current_status,
            "sent_at": c.sent_at,
            "delivered_at": c.delivered_at,
            "opened_at": c.opened_at,
            "clicked_at": c.clicked_at,
            "converted_at": c.converted_at,
            "personalized_message": c.personalized_message[:120] + "..." if len(c.personalized_message) > 120 else c.personalized_message,
        })

    total_spent = sum(o["amount"] for o in orders_data)
    return Response({
        "customer": CustomerSerializer(customer).data,
        "total_spent": total_spent,
        "order_count": len(orders_data),
        "orders": orders_data,
        "communications": comms_data,
    })


class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.select_related("customer").all().order_by("-order_date")
    serializer_class = OrderSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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