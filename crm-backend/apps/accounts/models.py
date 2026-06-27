from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("marketing_manager", "Marketing Manager"),
        ("sales_executive", "Sales Executive"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="marketing_manager")
    company = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar_initials = models.CharField(max_length=4, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.avatar_initials and self.user:
            parts = (self.user.get_full_name() or self.user.username).split()
            self.avatar_initials = "".join(p[0].upper() for p in parts[:2])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
