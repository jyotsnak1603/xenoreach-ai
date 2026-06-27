from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Campaign
from .serializers import CampaignSerializer
from apps.communications.models import Communication
from apps.segments.services import get_customers_for_segment
from .services import dispatch_to_channel_service


class CampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Campaign.objects.filter(owner=self.request.user).select_related("segment").order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        channel_filter = self.request.query_params.get("channel")
        search = self.request.query_params.get("search")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if channel_filter:
            qs = qs.filter(channel=channel_filter)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Campaign.objects.filter(owner=self.request.user).select_related("segment")


@api_view(["POST"])
def launch_campaign(request, pk):
    try:
        campaign = Campaign.objects.select_related("segment").get(pk=pk, owner=request.user)
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


@api_view(["POST"])
def duplicate_campaign(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk, owner=request.user)
    except Campaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=status.HTTP_404_NOT_FOUND)

    new_campaign = Campaign.objects.create(
        owner=request.user,
        name=f"Copy of {campaign.name}",
        product_name=campaign.product_name,
        industry=campaign.industry,
        budget=campaign.budget,
        goal=campaign.goal,
        segment=campaign.segment,
        channel=campaign.channel,
        message_template=campaign.message_template,
        ai_reasoning=campaign.ai_reasoning,
        status="draft",
    )
    return Response(CampaignSerializer(new_campaign).data, status=status.HTTP_201_CREATED)