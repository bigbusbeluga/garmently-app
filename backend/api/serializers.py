from rest_framework import serializers
from .models import Category, Garment, Outfit

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at']

class GarmentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Garment
        fields = [
            'id', 'name', 'description', 'category', 'category_name', 
            'color', 'size', 'price', 'brand', 'image', 'image_url',
            'is_favorite', 'times_worn', 'last_worn', 'purchase_date',
            'created_at', 'updated_at'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class OutfitSerializer(serializers.ModelSerializer):
    garments = GarmentSerializer(many=True, read_only=True)
    garment_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Outfit
        fields = [
            'id', 'name', 'garments', 'garment_ids', 'occasion', 
            'season', 'notes', 'created_at'
        ]
    
    def create(self, validated_data):
        garment_ids = validated_data.pop('garment_ids', [])
        outfit = Outfit.objects.create(**validated_data)
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