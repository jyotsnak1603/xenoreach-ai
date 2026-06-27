from rest_framework import serializers
from .models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    segment_name = serializers.CharField(source="segment.name", read_only=True)

    class Meta:
        model = Campaign
        fields = "__all__"
        read_only_fields = [
            "owner",
            "status",
            "target_audience_count",
            "launched_at",
            "dispatch_started_at",
            "dispatch_completed_at",
        ]