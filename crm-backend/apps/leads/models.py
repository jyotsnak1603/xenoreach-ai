from django.db import models
from django.contrib.auth.models import User


class Lead(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("contacted", "Contacted"),
        ("interested", "Interested"),
        ("converted", "Converted"),
        ("lost", "Lost"),
    ]

    SOURCE_CHOICES = [
        ("referral", "Referral"),
        ("website", "Website"),
        ("whatsapp", "WhatsApp"),
        ("email", "Email Campaign"),
        ("social", "Social Media"),
        ("ads", "Paid Ads"),
        ("event", "Event"),
        ("cold_call", "Cold Call"),
        ("other", "Other"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="leads",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=120, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="website")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    assigned_to = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)

    # AI Scoring
    lead_score = models.IntegerField(default=0)
    score_reason = models.TextField(blank=True)
    conversion_probability = models.CharField(max_length=20, blank=True)  # high/medium/low
    score_computed_at = models.DateTimeField(null=True, blank=True)

    # AI Follow-up
    follow_up_suggestion = models.TextField(blank=True)
    follow_up_generated_at = models.DateTimeField(null=True, blank=True)

    last_contacted = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["owner", "source"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.status})"


class LeadActivity(models.Model):
    ACTIVITY_CHOICES = [
        ("created", "Lead Created"),
        ("contacted", "Contacted"),
        ("email_sent", "Email Sent"),
        ("whatsapp_sent", "WhatsApp Sent"),
        ("call", "Call Made"),
        ("meeting", "Meeting Scheduled"),
        ("note", "Note Added"),
        ("status_change", "Status Changed"),
        ("converted", "Converted"),
        ("lost", "Lost"),
    ]

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_CHOICES)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="lead_activities"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.lead.name} — {self.activity_type}"
