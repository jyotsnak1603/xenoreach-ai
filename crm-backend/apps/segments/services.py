from datetime import timedelta
from django.db.models import Sum, Count, Max
from django.utils import timezone
from apps.customers.models import Customer


def get_customers_for_segment(segment):
    rules = segment.rules_json or {}

    customers = Customer.objects.annotate(
        total_spent=Sum("orders__amount"),
        order_count=Count("orders"),
        last_order_date=Max("orders__order_date"),
    )

    if "city" in rules:
        customers = customers.filter(city__iexact=rules["city"])

    if "preferred_channel" in rules:
        customers = customers.filter(preferred_channel=rules["preferred_channel"])

    if "age_gte" in rules:
        customers = customers.filter(age__gte=rules["age_gte"])

    if "age_lte" in rules:
        customers = customers.filter(age__lte=rules["age_lte"])

    if "total_spent_gt" in rules:
        customers = customers.filter(total_spent__gt=rules["total_spent_gt"])

    if "order_count_gte" in rules:
        customers = customers.filter(order_count__gte=rules["order_count_gte"])

    if "last_purchase_days_gt" in rules:
        cutoff_date = timezone.now() - timedelta(days=rules["last_purchase_days_gt"])
        customers = customers.filter(last_order_date__lt=cutoff_date)

    if "last_purchase_days_lte" in rules:
        cutoff_date = timezone.now() - timedelta(days=rules["last_purchase_days_lte"])
        customers = customers.filter(last_order_date__gte=cutoff_date)

    return customers