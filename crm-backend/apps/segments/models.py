from django.db import models

# Create your models here.

class Segment(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    rules_json = models.JSONField()

    created_by_ai = models.BooleanField(default=False)
    ai_explanation = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name