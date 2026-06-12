from django.db import models
from apps.campaigns.models import Campaign
from apps.customers.models import Customer

# Create your models here.

class Communication(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("failed", "Failed"),
        ("opened", "Opened"),
        ("read", "Read"),
        ("clicked", "Clicked"),
        ("converted", "Converted"),
    ]

    CHANNEL_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("sms", "SMS"),
        ("email", "Email"),
        ("rcs", "RCS"),
    ]

    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="communications"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="communications"
    )

    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    recipient = models.CharField(max_length=150)
    personalized_message = models.TextField()

    current_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="created"
    )

    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    converted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["campaign"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["current_status"]),
        ]

    def __str__(self):
        return f"{self.campaign.name} - {self.customer.name}"


class CommunicationEvent(models.Model):
    EVENT_CHOICES = Communication.STATUS_CHOICES

    communication = models.ForeignKey(
        Communication,
        on_delete=models.CASCADE,
        related_name="events"
    )
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    channel = models.CharField(max_length=20)
    metadata_json = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["communication", "event_type"],
                name="unique_communication_event_type"
            )
        ]
        indexes = [
            models.Index(fields=["communication"]),
            models.Index(fields=["event_type"]),
        ]

    def __str__(self):
        return f"{self.communication.id} - {self.event_type}"