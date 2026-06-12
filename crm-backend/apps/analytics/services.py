from apps.campaigns.models import Campaign
from apps.communications.models import Communication
from apps.customers.models import Order


def calculate_campaign_analytics(campaign_id):
    campaign = Campaign.objects.get(id=campaign_id)

    communications = Communication.objects.filter(campaign=campaign)

    audience_count = campaign.target_audience_count
    sent = communications.filter(current_status__in=[
        "sent", "delivered", "opened", "read", "clicked", "converted"
    ]).count()
    delivered = communications.filter(current_status__in=[
        "delivered", "opened", "read", "clicked", "converted"
    ]).count()
    failed = communications.filter(current_status="failed").count()
    opened = communications.filter(current_status__in=[
        "opened", "read", "clicked", "converted"
    ]).count()
    clicked = communications.filter(current_status__in=[
        "clicked", "converted"
    ]).count()
    converted = communications.filter(current_status="converted").count()

    conversion_rate = round((converted / audience_count) * 100, 2) if audience_count else 0
    click_rate = round((clicked / audience_count) * 100, 2) if audience_count else 0
    open_rate = round((opened / audience_count) * 100, 2) if audience_count else 0

    converted_customer_ids = communications.filter(
        current_status="converted"
    ).values_list("customer_id", flat=True)

    revenue_generated = Order.objects.filter(
        customer_id__in=converted_customer_ids
    ).values_list("amount", flat=True)

    total_revenue = sum(revenue_generated)

    return {
        "campaign_id": campaign.id,
        "campaign_name": campaign.name,
        "channel": campaign.channel,
        "status": campaign.status,
        "audience_count": audience_count,
        "sent": sent,
        "delivered": delivered,
        "failed": failed,
        "opened_or_read": opened,
        "clicked": clicked,
        "converted": converted,
        "open_rate": open_rate,
        "click_rate": click_rate,
        "conversion_rate": conversion_rate,
        "revenue_generated": float(total_revenue),
    }