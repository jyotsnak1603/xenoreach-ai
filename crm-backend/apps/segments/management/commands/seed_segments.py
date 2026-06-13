from django.core.management.base import BaseCommand
from apps.segments.models import Segment


SEED_SEGMENTS = [
    {
        "name": "High-Value Delhi Customers",
        "description": "Premium buyers in Delhi with total spend above ₹5,000. High loyalty, strong brand affinity.",
        "rules_json": {"city": "Delhi", "total_spent_gt": 5000},
        "created_by_ai": True,
        "ai_explanation": "Delhi contributes 28% of total revenue. High-spend customers here show 3x repeat purchase rate.",
    },
    {
        "name": "Inactive WhatsApp Users (90d)",
        "description": "WhatsApp-preferring customers who haven't purchased in over 90 days. High re-engagement potential via personalized nudges.",
        "rules_json": {"last_purchase_days_gt": 90, "preferred_channel": "whatsapp"},
        "created_by_ai": True,
        "ai_explanation": "WhatsApp has 95% open rate. Customers inactive 90+ days respond well to personalised win-back messages.",
    },
    {
        "name": "Young Mumbai Shoppers",
        "description": "Gen-Z and millennial shoppers (under 30) in Mumbai. Trend-sensitive, brand-conscious, mobile-first.",
        "rules_json": {"city": "Mumbai", "age_lte": 30},
        "created_by_ai": False,
        "ai_explanation": "",
    },
    {
        "name": "Repeat Loyalists (5+ Orders)",
        "description": "Power users who have placed 5 or more orders. Your most engaged and highest-LTV segment.",
        "rules_json": {"order_count_gte": 5},
        "created_by_ai": True,
        "ai_explanation": "Acquiring a new customer costs 5x more than retaining existing ones. This segment drives disproportionate revenue.",
    },
    {
        "name": "Festive VIP Spenders",
        "description": "Ultra-premium customers with lifetime spend above ₹10,000. Targets for exclusive early access and VIP offers.",
        "rules_json": {"total_spent_gt": 10000},
        "created_by_ai": True,
        "ai_explanation": "Top 5% of customers by spend. These customers respond to exclusivity and premium experiences over discounts.",
    },
    {
        "name": "SMS Bangalore Segment",
        "description": "SMS-preferring customers in Bangalore. Reliable delivery, high open rates for regional campaigns.",
        "rules_json": {"city": "Bangalore", "preferred_channel": "sms"},
        "created_by_ai": False,
        "ai_explanation": "",
    },
    {
        "name": "Email Re-engagement",
        "description": "Email-preferring customers who haven't purchased in 60+ days. Ideal for newsletter and offer campaigns.",
        "rules_json": {"last_purchase_days_gt": 60, "preferred_channel": "email"},
        "created_by_ai": True,
        "ai_explanation": "Email campaigns for churned users show 12% conversion if the discount is personalised to past purchase categories.",
    },
    {
        "name": "New Converts (Last 30 Days)",
        "description": "Customers who made their first purchase within the last 30 days. Critical window to build habit and loyalty.",
        "rules_json": {"order_count_gte": 1, "last_purchase_days_lte": 30},
        "created_by_ai": True,
        "ai_explanation": "The first 30 days determine if a customer becomes a repeat buyer. A well-timed thank-you campaign lifts retention by 40%.",
    },
    {
        "name": "RCS Early Adopters",
        "description": "Tech-forward customers who prefer RCS channel. Rich media, interactive buttons — highest engagement potential.",
        "rules_json": {"preferred_channel": "rcs"},
        "created_by_ai": False,
        "ai_explanation": "",
    },
    {
        "name": "Jaipur High-Potential",
        "description": "Customers in Jaipur with spend above ₹2,000. An emerging market with 40% YoY growth in engagement.",
        "rules_json": {"city": "Jaipur", "total_spent_gt": 2000},
        "created_by_ai": True,
        "ai_explanation": "Jaipur is an underserved market with high intent signals. Early investment in this segment builds long-term brand equity.",
    },
]


class Command(BaseCommand):
    help = "Seed 10 rich, diverse audience segments for demo purposes"

    def handle(self, *args, **kwargs):
        created_count = 0
        skipped_count = 0

        for seg_data in SEED_SEGMENTS:
            obj, created = Segment.objects.get_or_create(
                name=seg_data["name"],
                defaults={
                    "description": seg_data["description"],
                    "rules_json": seg_data["rules_json"],
                    "created_by_ai": seg_data["created_by_ai"],
                    "ai_explanation": seg_data["ai_explanation"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  [OK] Created: {obj.name}"))
            else:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f"  [--] Skipped (exists): {obj.name}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! {created_count} segments created, {skipped_count} already existed."
            )
        )
