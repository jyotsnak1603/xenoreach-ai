from django.db import models
from apps.segments.models import Segment

# Create your models here.

class Campaign(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("launching", "Launching"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    CHANNEL_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("sms", "SMS"),
        ("email", "Email"),
        ("rcs", "RCS"),
    ]

    name = models.CharField(max_length=150)
    goal = models.TextField()
    segment = models.ForeignKey(
        Segment,
        on_delete=models.PROTECT,
        related_name="campaigns"
    )
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    message_template = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )

    target_audience_count = models.PositiveIntegerField(default=0)
    ai_reasoning = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    launched_at = models.DateTimeField(null=True, blank=True)
    dispatch_started_at = models.DateTimeField(null=True, blank=True)
    dispatch_completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["segment"]),
        ]

    def __str__(self):
        return self.name