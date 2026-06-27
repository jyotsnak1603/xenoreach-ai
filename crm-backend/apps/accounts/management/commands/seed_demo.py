import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction

from apps.accounts.models import UserProfile
from apps.customers.models import Customer, Order
from apps.segments.models import Segment
from apps.campaigns.models import Campaign
from apps.leads.models import Lead, LeadActivity
from apps.communications.models import Communication


class Command(BaseCommand):
    help = 'Seeds the database with fresh demo data for a polished presentation.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write("Wiping old data...")
        # Must delete child data BEFORE users due to PROTECT foreign keys on owner
        from apps.communications.models import Communication
        Communication.objects.all().delete()
        Lead.objects.all().delete()
        Campaign.objects.all().delete()
        Segment.objects.all().delete()
        Customer.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # 1. Create Users
        self.stdout.write("Creating demo users...")
        users_data = [
            {"username": "admin", "email": "admin@xenoreach.ai", "role": "admin", "first": "Alice", "last": "Admin", "company": "XenoReach Corp"},
            {"username": "marketer", "email": "marketer@xenoreach.ai", "role": "marketing_manager", "first": "Bob", "last": "Marketer", "company": "Acme D2C"},
            {"username": "sales", "email": "sales@xenoreach.ai", "role": "sales_executive", "first": "Charlie", "last": "Sales", "company": "Acme B2B"},
        ]

        users = []
        for d in users_data:
            user = User.objects.create_user(
                username=d["username"],
                email=d["email"],
                password="password123",
                first_name=d["first"],
                last_name=d["last"]
            )
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = d["role"]
            profile.company = d["company"]
            profile.save()
            users.append(user)
        
        main_user = users[1] # marketer

        # 2. Create Customers & Orders
        self.stdout.write("Creating customers and orders...")
        names = ["Aarav Sharma", "Isha Verma", "Rohan Mehta", "Ananya Singh", "Kabir Gupta", "Priya Desai", "Vikram Rathore", "Neha Kapoor"]
        cities = ["Delhi", "Mumbai", "Bangalore", "Pune", "Jaipur", "Hyderabad"]
        channels = ["whatsapp", "sms", "email"]
        
        for i in range(15):
            customer = Customer.objects.create(
                name=f"{random.choice(names)} {i+1}",
                email=f"customer{i+1}@example.com",
                phone=f"900000{i+1:04d}",
                city=random.choice(cities),
                age=random.randint(18, 55),
                gender=random.choice(["male", "female", "other"]),
                preferred_channel=random.choice(channels),
            )
            for _ in range(random.randint(1, 4)):
                Order.objects.create(
                    customer=customer,
                    product_category=random.choice(["Coffee", "Skincare", "Fashion", "Electronics"]),
                    amount=random.randint(500, 12000),
                    order_date=timezone.now() - timedelta(days=random.randint(1, 90)),
                )

        # 3. Create Segments
        self.stdout.write("Creating segments...")
        seg1 = Segment.objects.create(
            owner=main_user,
            name="High-Value Customers",
            description="Customers who spent more than 10k",
            rules_json={"total_spent_gt": 10000},
            created_by_ai=True,
            ai_explanation="Identified top 20% spenders based on historical order data."
        )
        seg2 = Segment.objects.create(
            owner=main_user,
            name="Inactive Delhi Users",
            description="Delhi residents who haven't bought in 30 days",
            rules_json={"city": "Delhi", "last_purchase_days_gt": 30}
        )

        # 4. Create Campaigns
        self.stdout.write("Creating campaigns...")
        cam1 = Campaign.objects.create(
            owner=main_user,
            name="Diwali VIP Reactivation",
            product_name="Premium Gift Box",
            industry="Retail",
            goal="Bring back inactive VIP customers for Diwali",
            segment=seg2,
            channel="whatsapp",
            message_template="Hi {{name}}, we have a special Diwali offer for you!",
            status="active",
            target_audience_count=12,
            ai_reasoning="WhatsApp is highly effective for festival greetings with high open rates."
        )

        # 4.5 Create Communications for Analytics
        self.stdout.write("Seeding campaign communications...")
        campaign_customers = Customer.objects.order_by("?")[:cam1.target_audience_count]
        statuses = ["sent", "delivered", "opened", "clicked", "converted"]
        weights = [1, 2, 4, 3, 2] # More likely to be opened/delivered
        
        for idx, customer in enumerate(campaign_customers):
            # Guarantee at least some converted and clicked for realistic data
            if idx == 0:
                final_status = "converted"
            elif idx == 1 or idx == 2:
                final_status = "clicked"
            elif idx < 8:
                final_status = "opened"
            else:
                final_status = "delivered"

            msg = f"Hi {customer.name}, we have a special Diwali offer for you!"
            Communication.objects.create(
                campaign=cam1,
                customer=customer,
                channel=cam1.channel,
                recipient=customer.phone or customer.email,
                personalized_message=msg,
                current_status=final_status,
                sent_at=timezone.now() - timedelta(days=2),
                delivered_at=timezone.now() - timedelta(days=2, hours=-1) if final_status in ["delivered", "opened", "clicked", "converted"] else None,
                opened_at=timezone.now() - timedelta(days=1) if final_status in ["opened", "clicked", "converted"] else None,
                clicked_at=timezone.now() - timedelta(hours=12) if final_status in ["clicked", "converted"] else None,
            )

        # 5. Create Leads
        self.stdout.write("Creating leads...")
        companies = ["TechCorp", "Startup Inc", "Retail Giant", "Local Shop", ""]
        sources = ["website", "referral", "whatsapp", "cold_call"]
        statuses = ["new", "contacted", "interested", "converted", "lost"]
        
        for i in range(10):
            status = random.choice(statuses)
            created_at = timezone.now() - timedelta(days=random.randint(1, 30))
            last_contacted = created_at + timedelta(days=random.randint(1, 5)) if status != "new" else None
            
            lead = Lead.objects.create(
                owner=main_user,
                name=f"{random.choice(names)} {random.randint(100, 999)}",
                email=f"lead{i}@example.com",
                phone=f"987654{i:04d}",
                company=random.choice(companies),
                source=random.choice(sources),
                status=status,
                lead_score=random.randint(20, 95),
                conversion_probability=random.choice(["high", "medium", "low"]),
                last_contacted=last_contacted,
            )
            # Override created_at
            Lead.objects.filter(pk=lead.pk).update(created_at=created_at)

            # Lead activities
            LeadActivity.objects.create(lead=lead, activity_type="created", note="Lead entered CRM", created_by=main_user)
            if status != "new":
                LeadActivity.objects.create(lead=lead, activity_type="contacted", note="Sent initial outreach", created_by=main_user)

        self.stdout.write(self.style.SUCCESS("Successfully seeded demo data! Users: admin / marketer / sales (pw: password123)"))
