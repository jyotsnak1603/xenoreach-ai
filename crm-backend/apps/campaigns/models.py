from django.db import models
from django.contrib.auth.models import User
from apps.segments.models import Segment


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

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="campaigns",
        null=True,
        blank=True,
    )

    name = models.CharField(max_length=150)
    product_name = models.CharField(max_length=120, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
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
            models.Index(fields=["owner"]),
        ]

    def __str__(self):
        return self.name