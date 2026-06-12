from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from apps.campaigns.models import Campaign
from .services import calculate_campaign_analytics


@api_view(["GET"])
def campaign_analytics(request, pk):
    try:
        data = calculate_campaign_analytics(pk)
    except Campaign.DoesNotExist:
        return Response(
            {"error": "Campaign not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response(data)