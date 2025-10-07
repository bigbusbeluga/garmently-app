from django.contrib import admin
from .models import Category, Garment, Outfit

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(Garment)
class GarmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'color', 'size', 'price', 'is_favorite', 'created_at']
    list_filter = ['category', 'size', 'is_favorite', 'created_at']
    search_fields = ['name', 'color', 'brand']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'brand')
        }),
        ('Details', {
            'fields': ('color', 'size', 'price', 'image')
        }),
        ('Preferences', {
            'fields': ('is_favorite', 'times_worn', 'last_worn', 'purchase_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Outfit)
class OutfitAdmin(admin.ModelAdmin):
    list_display = ['name', 'occasion', 'season', 'created_at']
    list_filter = ['occasion', 'season', 'created_at']
    search_fields = ['name', 'notes']
    filter_horizontal = ['garments']
