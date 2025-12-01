from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Garment, Outfit, LaundryItem, WearHistory

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True, max_length=500)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'profile_picture', 'bio']
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        """Add profile_picture and bio from profile if exists"""
        data = super().to_representation(instance)
        # Add empty fields for profile picture and bio (can be extended with Profile model)
        data['profile_picture'] = None
        data['bio'] = ''
        return data

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()  # Can be username or email
    password = serializers.CharField(write_only=True)

class CategorySerializer(serializers.ModelSerializer):
    garment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'description', 'garment_count', 'created_at']
    
    def get_garment_count(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.garment_set.filter(owner=request.user).count()
        return obj.garment_set.count()

class GarmentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    image_url = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    size_display = serializers.CharField(source='get_size_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Garment
        fields = [
            'id', 'name', 'description', 'category', 'category_name', 'category_icon',
            'color', 'size', 'size_display', 'price', 'brand', 'image', 'image_url',
            'season', 'season_display', 'material', 'care_instructions',
            'status', 'status_display', 'is_favorite', 'times_worn', 'last_worn', 
            'purchase_date', 'owner', 'owner_username', 'is_available',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'owner': {'read_only': True}
        }
    
    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            print(f"Image URL for {obj.name}: {url}")
            # If using S3, the URL should be complete
            # If using local storage, we might need to add the domain
            request = self.context.get('request')
            if request and not url.startswith('http'):
                return request.build_absolute_uri(url)
            return url
        print(f"No image for {obj.name}")
        return None

class GarmentSummarySerializer(serializers.ModelSerializer):
    """Simplified garment serializer for lists and summaries"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Garment
        fields = [
            'id', 'name', 'category_name', 'color', 'size', 
            'image_url', 'status', 'status_display', 'is_favorite'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            request = self.context.get('request')
            if request and not url.startswith('http'):
                return request.build_absolute_uri(url)
            return url
        return None

class OutfitSerializer(serializers.ModelSerializer):
    garments = GarmentSummarySerializer(many=True, read_only=True)
    garment_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    occasion_display = serializers.CharField(source='get_occasion_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    garment_count = serializers.SerializerMethodField()
    is_complete = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Outfit
        fields = [
            'id', 'name', 'garments', 'garment_ids', 'occasion', 'occasion_display',
            'season', 'season_display', 'notes', 'layout', 'rating', 'is_favorite',
            'times_worn', 'last_worn', 'owner', 'owner_username', 'weather',
            'date', 'garment_count', 'is_complete', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'owner': {'read_only': True}
        }
    
    def get_garment_count(self, obj):
        return obj.get_garment_count()
    
    def create(self, validated_data):
        garment_ids = validated_data.pop('garment_ids', [])
        outfit = Outfit.objects.create(**validated_data)
        if garment_ids:
            outfit.garments.set(garment_ids)
        return outfit
    
    def update(self, instance, validated_data):
        garment_ids = validated_data.pop('garment_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if garment_ids is not None:
            instance.garments.set(garment_ids)
        
        return instance

class LaundryItemSerializer(serializers.ModelSerializer):
    garment = GarmentSummarySerializer(read_only=True)
    garment_id = serializers.IntegerField(write_only=True)
    garment_name = serializers.CharField(source='garment.name', read_only=True)
    
    class Meta:
        model = LaundryItem
        fields = [
            'id', 'garment', 'garment_id', 'garment_name', 'wash_date',
            'estimated_completion', 'is_completed', 'completion_date', 'notes'
        ]

class WearHistorySerializer(serializers.ModelSerializer):
    garment = GarmentSummarySerializer(read_only=True)
    outfit = OutfitSerializer(read_only=True)
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = WearHistory
        fields = [
            'id', 'garment', 'outfit', 'item_name', 'item_type',
            'date_worn', 'occasion', 'weather', 'rating', 'notes'
        ]
    
    def get_item_name(self, obj):
        if obj.garment:
            return obj.garment.name
        elif obj.outfit:
            return obj.outfit.name
        return "Unknown"
    
    def get_item_type(self, obj):
        if obj.garment:
            return "garment"
        elif obj.outfit:
            return "outfit"
        return "unknown"

class OutfitSummarySerializer(serializers.ModelSerializer):
    """Simplified outfit serializer for lists"""
    garment_count = serializers.SerializerMethodField()
    occasion_display = serializers.CharField(source='get_occasion_display', read_only=True)
    
    class Meta:
        model = Outfit
        fields = [
            'id', 'name', 'occasion', 'occasion_display', 'season',
            'garment_count', 'rating', 'is_favorite', 'created_at'
        ]
    
    def get_garment_count(self, obj):
        return obj.get_garment_count()

# Statistics Serializers
class WardrobeStatsSerializer(serializers.Serializer):
    """Serializer for wardrobe statistics"""
    total_garments = serializers.IntegerField()
    clean_garments = serializers.IntegerField()
    dirty_garments = serializers.IntegerField()
    washing_garments = serializers.IntegerField()
    favorite_garments = serializers.IntegerField()
    total_outfits = serializers.IntegerField()
    categories = serializers.DictField()
    recent_activity = serializers.ListField()