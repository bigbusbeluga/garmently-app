from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string

class Profile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

class EmailVerification(models.Model):
    """Store email verification codes"""
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    @staticmethod
    def generate_code():
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        """Check if verification code has expired (10 minutes)"""
        from django.conf import settings
        expiry_minutes = getattr(settings, 'VERIFICATION_CODE_EXPIRY', 10)
        return timezone.now() > self.created_at + timezone.timedelta(minutes=expiry_minutes)
    
    def __str__(self):
        return f"{self.email} - {self.code}"
    
    class Meta:
        ordering = ['-created_at']

class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, help_text="CSS icon class")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

class Garment(models.Model):
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
    ]
    
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
        ('all', 'All Seasons'),
    ]
    
    STATUS_CHOICES = [
        ('clean', 'Clean'),
        ('dirty', 'Dirty'),
        ('washing', 'In Laundry'),
        ('damaged', 'Damaged'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    # Physical Properties
    color = models.CharField(max_length=50)
    size = models.CharField(max_length=3, choices=SIZE_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Image - S3 Upload
    image = models.ImageField(upload_to='garments/', blank=True, null=True)
    
    # Clothing Attributes
    season = models.CharField(max_length=10, choices=SEASON_CHOICES, default='all')
    material = models.CharField(max_length=100, blank=True)
    care_instructions = models.TextField(blank=True)
    
    # Status and Usage
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='clean')
    is_favorite = models.BooleanField(default=False)
    times_worn = models.PositiveIntegerField(default=0)
    last_worn = models.DateField(blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    
    # User Association (for multi-user support)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.color} ({self.size})"
    
    def is_available(self):
        """Check if garment is available to wear"""
        return self.status == 'clean'
    
    def mark_worn(self):
        """Mark garment as worn and update statistics"""
        from django.utils import timezone
        self.times_worn += 1
        self.last_worn = timezone.now().date()
        self.save()
    
    class Meta:
        ordering = ['-created_at']

class Outfit(models.Model):
    OCCASION_CHOICES = [
        ('casual', 'Casual'),
        ('work', 'Work'),
        ('formal', 'Formal'),
        ('party', 'Party'),
        ('date', 'Date'),
        ('exercise', 'Exercise'),
        ('travel', 'Travel'),
        ('special', 'Special Event'),
    ]
    
    name = models.CharField(max_length=200)
    garments = models.ManyToManyField(Garment, related_name='outfits')
    occasion = models.CharField(max_length=20, choices=OCCASION_CHOICES, blank=True)
    season = models.CharField(max_length=10, choices=Garment.SEASON_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    layout = models.TextField(blank=True, help_text="JSON string storing garment positions and z-index")
    
    # Rating and feedback
    rating = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Rate 1-5 stars")
    is_favorite = models.BooleanField(default=False)
    times_worn = models.PositiveIntegerField(default=0)
    last_worn = models.DateField(blank=True, null=True)
    
    # User Association
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Weather/Date information
    weather = models.CharField(max_length=100, blank=True)
    date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def get_garment_count(self):
        """Get number of garments in this outfit"""
        return self.garments.count()
    
    def is_complete(self):
        """Check if outfit has at least one garment"""
        return self.garments.exists()
    
    class Meta:
        ordering = ['-created_at']

class LaundryItem(models.Model):
    """Track items in laundry"""
    garment = models.ForeignKey(Garment, on_delete=models.CASCADE)
    wash_date = models.DateField(auto_now_add=True)
    estimated_completion = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Laundry: {self.garment.name}"
    
    def complete_wash(self):
        """Mark laundry as completed"""
        from django.utils import timezone
        self.is_completed = True
        self.completion_date = timezone.now().date()
        self.garment.status = 'clean'
        self.garment.save()
        self.save()

class WearHistory(models.Model):
    """Track when garments and outfits were worn"""
    garment = models.ForeignKey(Garment, on_delete=models.CASCADE, null=True, blank=True)
    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE, null=True, blank=True)
    date_worn = models.DateField(auto_now_add=True)
    occasion = models.CharField(max_length=100, blank=True)
    weather = models.CharField(max_length=100, blank=True)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        item = self.garment or self.outfit
        return f"{item} worn on {self.date_worn}"
    
    class Meta:
        ordering = ['-date_worn']
