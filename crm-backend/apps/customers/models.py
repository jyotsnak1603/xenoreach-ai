from django.db import models

# Create your models here.

class Customer(models.Model):
    CHANNEL_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("sms", "SMS"),
        ("email", "Email"),
        ("rcs", "RCS"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    city = models.CharField(max_length=80)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    preferred_channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["preferred_channel"]),
        ]

    def __str__(self):
        return self.name


class Order(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="orders"
    )
    product_category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField()
    source_communication = models.ForeignKey(
        'communications.Communication',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attributed_orders"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["customer"]),
            models.Index(fields=["order_date"]),
        ]

    def __str__(self):
        return f"{self.customer.name} - ₹{self.amount}"