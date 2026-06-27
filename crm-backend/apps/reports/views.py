import csv
import io
from datetime import timedelta

from django.utils import timezone
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import permission_classes

from apps.campaigns.models import Campaign
from apps.segments.models import Segment
from apps.leads.models import Lead
from apps.communications.models import Communication


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    campaigns = Campaign.objects.filter(owner=user)
    total_campaigns = campaigns.count()
    active_campaigns = campaigns.filter(status="active").count()
    segments = Segment.objects.filter(owner=user).count()
    leads = Lead.objects.filter(owner=user)
    total_leads = leads.count()
    converted = leads.filter(status="converted").count()
    conversion_rate = round((converted / total_leads * 100), 1) if total_leads > 0 else 0

    # Content generated = campaigns that have ai_reasoning (AI-generated content)
    generated_content = campaigns.exclude(ai_reasoning="").count()

    # Leads needing follow-up (not contacted in 5+ days)
    cutoff = timezone.now() - timedelta(days=5)
    followup_needed = leads.filter(
        status__in=["new", "contacted", "interested"]
    ).filter(
        last_contacted__lt=cutoff
    ).count() + leads.filter(
        status="new",
        last_contacted__isnull=True,
        created_at__lt=cutoff,
    ).count()

    return Response({
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "generated_content": generated_content,
        "audience_segments": segments,
        "total_leads": total_leads,
        "converted_leads": converted,
        "conversion_rate": conversion_rate,
        "followup_needed": followup_needed,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leads_by_source(request):
    from django.db.models import Count
    user = request.user
    data = (
        Lead.objects.filter(owner=user)
        .values("source")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    result = [{"source": row["source"], "count": row["count"]} for row in data]
    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leads_by_status(request):
    from django.db.models import Count
    user = request.user
    data = (
        Lead.objects.filter(owner=user)
        .values("status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    result = [{"status": row["status"], "count": row["count"]} for row in data]
    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def campaign_trend(request):
    """Return campaigns created per day for the last 30 days."""
    from django.db.models import Count
    from django.db.models.functions import TruncDate
    user = request.user
    cutoff = timezone.now() - timedelta(days=30)
    data = (
        Campaign.objects.filter(owner=user, created_at__gte=cutoff)
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    result = [{"date": str(row["date"]), "campaigns": row["count"]} for row in data]
    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications(request):
    """Return smart notifications for the user."""
    user = request.user
    items = []

    # Leads needing follow-up (5+ days without contact)
    cutoff = timezone.now() - timedelta(days=5)
    followup_leads = Lead.objects.filter(
        owner=user,
        status__in=["new", "contacted", "interested"],
    ).filter(
        last_contacted__lt=cutoff
    )
    uncontacted = Lead.objects.filter(
        owner=user,
        status="new",
        last_contacted__isnull=True,
        created_at__lt=cutoff,
    )

    count = followup_leads.count() + uncontacted.count()
    if count > 0:
        items.append({
            "type": "warning",
            "title": f"{count} lead{'s' if count != 1 else ''} need follow-up",
            "description": "These leads haven't been contacted in 5+ days.",
            "link": "/leads",
        })

    # Recently active campaigns
    active = Campaign.objects.filter(owner=user, status="active").count()
    if active:
        items.append({
            "type": "info",
            "title": f"{active} campaign{'s' if active != 1 else ''} currently running",
            "description": "Check analytics for live performance.",
            "link": "/analytics",
        })

    # Completed campaigns today
    today_start = timezone.now().replace(hour=0, minute=0, second=0)
    completed_today = Campaign.objects.filter(
        owner=user, status="completed", dispatch_completed_at__gte=today_start
    ).count()
    if completed_today:
        items.append({
            "type": "success",
            "title": f"{completed_today} campaign{'s' if completed_today != 1 else ''} completed today",
            "description": "View campaign analytics to see performance.",
            "link": "/analytics",
        })

    return Response(items)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_leads_csv(request):
    user = request.user
    leads = Lead.objects.filter(owner=user).order_by("-created_at")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "Email", "Phone", "Company", "Source",
        "Status", "Lead Score", "Conversion Probability",
        "Assigned To", "Last Contacted", "Created At",
    ])
    for lead in leads:
        writer.writerow([
            lead.id, lead.name, lead.email, lead.phone, lead.company,
            lead.get_source_display(), lead.get_status_display(),
            lead.lead_score, lead.conversion_probability,
            lead.assigned_to,
            lead.last_contacted.strftime("%Y-%m-%d %H:%M") if lead.last_contacted else "",
            lead.created_at.strftime("%Y-%m-%d %H:%M"),
        ])

    response = HttpResponse(output.getvalue(), content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="xenoreach_leads.csv"'
    return response
