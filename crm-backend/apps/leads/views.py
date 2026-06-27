from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Lead, LeadActivity
from .serializers import LeadSerializer, LeadListSerializer, LeadActivitySerializer
from .services import score_lead_with_ai, generate_followup_message


class LeadListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return LeadListSerializer
        return LeadSerializer

    def get_queryset(self):
        qs = Lead.objects.filter(owner=self.request.user)
        status_filter = self.request.query_params.get("status")
        source_filter = self.request.query_params.get("source")
        search = self.request.query_params.get("search")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if source_filter:
            qs = qs.filter(source=source_filter)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(email__icontains=search) | qs.filter(company__icontains=search)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        lead = serializer.save(owner=self.request.user)
        LeadActivity.objects.create(
            lead=lead,
            activity_type="created",
            note="Lead was added to CRM.",
            created_by=self.request.user,
        )


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer

    def get_queryset(self):
        return Lead.objects.filter(owner=self.request.user).prefetch_related("activities")

    def perform_update(self, serializer):
        old_status = self.get_object().status
        lead = serializer.save()
        if old_status != lead.status:
            LeadActivity.objects.create(
                lead=lead,
                activity_type="status_change",
                note=f"Status changed from {old_status} to {lead.status}.",
                created_by=self.request.user,
            )


@api_view(["POST"])
def score_lead(request, pk):
    try:
        lead = Lead.objects.get(pk=pk, owner=request.user)
    except Lead.DoesNotExist:
        return Response({"error": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

    result = score_lead_with_ai(lead)
    lead.lead_score = result["lead_score"]
    lead.score_reason = result["score_reason"]
    lead.conversion_probability = result["conversion_probability"]
    lead.score_computed_at = timezone.now()
    lead.save(update_fields=["lead_score", "score_reason", "conversion_probability", "score_computed_at"])

    LeadActivity.objects.create(
        lead=lead,
        activity_type="note",
        note=f"AI scored this lead: {result['lead_score']}/100 ({result['conversion_probability']} probability)",
        created_by=request.user,
    )

    return Response(result)


@api_view(["POST"])
def generate_followup(request, pk):
    try:
        lead = Lead.objects.get(pk=pk, owner=request.user)
    except Lead.DoesNotExist:
        return Response({"error": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

    message = generate_followup_message(lead)
    lead.follow_up_suggestion = message
    lead.follow_up_generated_at = timezone.now()
    lead.save(update_fields=["follow_up_suggestion", "follow_up_generated_at"])

    return Response({"follow_up_message": message})


@api_view(["POST"])
def mark_contacted(request, pk):
    try:
        lead = Lead.objects.get(pk=pk, owner=request.user)
    except Lead.DoesNotExist:
        return Response({"error": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

    note = request.data.get("note", "Manually marked as contacted.")
    channel = request.data.get("channel", "contacted")

    lead.last_contacted = timezone.now()
    if lead.status == "new":
        lead.status = "contacted"
    lead.save()

    LeadActivity.objects.create(
        lead=lead,
        activity_type=channel if channel in dict(LeadActivity.ACTIVITY_CHOICES) else "contacted",
        note=note,
        created_by=request.user,
    )

    return Response(LeadSerializer(lead).data)


@api_view(["GET"])
def lead_activities(request, pk):
    try:
        lead = Lead.objects.get(pk=pk, owner=request.user)
    except Lead.DoesNotExist:
        return Response({"error": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

    activities = lead.activities.order_by("-created_at")
    return Response(LeadActivitySerializer(activities, many=True).data)
