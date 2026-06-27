from rest_framework import serializers
from .models import Lead, LeadActivity


class LeadActivitySerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source="get_activity_type_display", read_only=True)

    class Meta:
        model = LeadActivity
        fields = ["id", "activity_type", "activity_type_display", "note", "created_at"]
        read_only_fields = ["id", "created_at"]


class LeadSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    source_display = serializers.CharField(source="get_source_display", read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)
    days_since_contact = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id", "name", "email", "phone", "company", "source", "source_display",
            "status", "status_display", "assigned_to", "notes",
            "lead_score", "score_reason", "conversion_probability", "score_computed_at",
            "follow_up_suggestion", "follow_up_generated_at",
            "last_contacted", "days_since_contact",
            "created_at", "updated_at", "activities",
        ]
        read_only_fields = [
            "id", "lead_score", "score_reason", "conversion_probability", "score_computed_at",
            "follow_up_suggestion", "follow_up_generated_at",
            "created_at", "updated_at", "activities",
        ]

    def get_days_since_contact(self, obj):
        if not obj.last_contacted:
            from django.utils import timezone
            delta = timezone.now() - obj.created_at
            return delta.days
        from django.utils import timezone
        delta = timezone.now() - obj.last_contacted
        return delta.days


class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (no nested activities)"""
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    source_display = serializers.CharField(source="get_source_display", read_only=True)
    days_since_contact = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id", "name", "email", "phone", "company", "source", "source_display",
            "status", "status_display", "assigned_to",
            "lead_score", "conversion_probability",
            "last_contacted", "days_since_contact",
            "created_at",
        ]

    def get_days_since_contact(self, obj):
        if not obj.last_contacted:
            from django.utils import timezone
            delta = timezone.now() - obj.created_at
            return delta.days
        from django.utils import timezone
        delta = timezone.now() - obj.last_contacted
        return delta.days
