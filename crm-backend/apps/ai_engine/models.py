from django.db import models
from apps.campaigns.models import Campaign

# Create your models here.


class AIRecommendation(models.Model):
    RECOMMENDATION_TYPES = [
        ("segment", "Segment"),
        ("message", "Message"),
        ("channel", "Channel"),
        ("insight", "Insight"),
        ("planner", "Planner"),
    ]

    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_recommendations"
    )

    recommendation_type = models.CharField(
        max_length=30,
        choices=RECOMMENDATION_TYPES
    )

    input_prompt = models.TextField()
    output_json = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recommendation_type} recommendation"