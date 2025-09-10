# app/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.conf import settings
from datetime import datetime
from io import BytesIO
import qrcode
from django.core.files import File
from django.urls import reverse


# Custom User model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username


# Donation model
class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('reserved', 'Reserved'),
    ]

    FOOD_TYPE_CHOICES = [
        ('Cooked Meals', 'Cooked Meals'),
        ('Bakery', 'Bakery'),
        ('Produce', 'Produce'),
        ('Dairy', 'Dairy'),
        ('Packaged', 'Packaged'),
    ]

    UNIT_CHOICES = [
        ('portions', 'Portions'),
        ('kg', 'kg'),
        ('loaves', 'Loaves'),
        ('litres', 'Litres'),
        ('packs', 'Packs'),
    ]

    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='donations'
    )
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    item_name = models.CharField(max_length=200)
    food_type = models.CharField(max_length=50, choices=FOOD_TYPE_CHOICES)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    pickup_location = models.TextField()
    date_available = models.DateField()
    time_available = models.TimeField()
    food_image = models.ImageField(upload_to='donations/food/', blank=True, null=True)
    packaging_image = models.ImageField(upload_to='donations/packaging/', blank=True, null=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    qr_code = models.ImageField(upload_to="donations/qrcodes/", blank=True, null=True)
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_donations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_qr(self, request=None):
        """Generate and save QR code for verification."""
        if request:
            verify_url = request.build_absolute_uri(
                reverse("verify_donation", args=[self.id])
            )
        else:
            verify_url = f"/verify/{self.id}/"

        qr = qrcode.make(verify_url)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        filename = f"donation_{self.id}_qr.png"
        self.qr_code.save(filename, File(buffer), save=False)
        buffer.close()

    def save(self, *args, **kwargs):
        """Override save to auto-generate QR if missing."""
        super().save(*args, **kwargs)

        if not self.qr_code:
            self.generate_qr()
            super().save(update_fields=["qr_code"])

    def __str__(self):
        return f"{self.item_name} by {self.donor.username}"

    class Meta:
        db_table = 'zerobite_donations'
        ordering = ['-created_at']
