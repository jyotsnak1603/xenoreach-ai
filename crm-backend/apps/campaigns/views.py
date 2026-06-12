from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone

from .models import Campaign
from .serializers import CampaignSerializer
from apps.communications.models import Communication
from apps.segments.services import get_customers_for_segment

from .services import dispatch_to_channel_service

class CampaignListCreateView(generics.ListCreateAPIView):
    queryset = Campaign.objects.select_related("segment").all().order_by("-created_at")
    serializer_class = CampaignSerializer


class CampaignDetailView(generics.RetrieveAPIView):
    queryset = Campaign.objects.select_related("segment").all()
    serializer_class = CampaignSerializer


@api_view(["POST"])
def launch_campaign(request, pk):
    try:
        campaign = Campaign.objects.select_related("segment").get(pk=pk)
    except Campaign.DoesNotExist:
        return Response(
            {"error": "Campaign not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if campaign.status != "draft":
        return Response(
            {"error": "Only draft campaigns can be launched"},
            status=status.HTTP_400_BAD_REQUEST
        )

    customers = get_customers_for_segment(campaign.segment)

    communications = []

    for customer in customers:
        recipient = customer.email if campaign.channel == "email" else customer.phone

        message = campaign.message_template.replace("{{name}}", customer.name)

        communication = Communication.objects.create(
            campaign=campaign,
            customer=customer,
            channel=campaign.channel,
            recipient=recipient,
            personalized_message=message,
            current_status="created",
        )

        dispatch_to_channel_service(communication)
        
        communications.append(communication)

    campaign.target_audience_count = len(communications)
    campaign.status = "launching"
    campaign.launched_at = timezone.now()
    campaign.dispatch_started_at = timezone.now()
    campaign.save()

    return Response(
        {
            "message": "Campaign launch started",
            "campaign_id": campaign.id,
            "target_audience_count": campaign.target_audience_count,
            "communications_created": len(communications),
            "status": campaign.status,
        },
        status=status.HTTP_200_OK,
    )