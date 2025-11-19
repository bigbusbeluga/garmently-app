from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Category, Garment, Outfit, LaundryItem, WearHistory

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'garment_count', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    def garment_count(self, obj):
        from django.db.models import Count
        count = obj.garment_set.count()
        if count:
            url = reverse('admin:api_garment_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} garments</a>', url, count)
        return "0 garments"
    garment_count.short_description = "Garments"

@admin.register(Garment)
class GarmentAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'name', 'category', 'color', 'size', 'status', 'owner', 'times_worn', 'is_favorite']
    list_filter = ['category', 'size', 'season', 'status', 'is_favorite', 'created_at', 'owner']
    search_fields = ['name', 'color', 'brand', 'material']
    readonly_fields = ['created_at', 'updated_at', 'image_preview_large']
    list_editable = ['is_favorite', 'status']
    list_per_page = 25
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'brand', 'owner')
        }),
        ('Physical Properties', {
            'fields': ('color', 'size', 'material', 'season', 'price')
        }),
        ('Image', {
            'fields': ('image', 'image_preview_large')
        }),
        ('Status & Usage', {
            'fields': ('status', 'is_favorite', 'times_worn', 'last_worn', 'purchase_date')
        }),
        ('Care', {
            'fields': ('care_instructions',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = "Image"
    
    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; object-fit: contain;" />',
                obj.image.url
            )
        return "No image uploaded"
    image_preview_large.short_description = "Current Image"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category', 'owner')

@admin.register(Outfit)
class OutfitAdmin(admin.ModelAdmin):
    list_display = ['name', 'garment_count', 'occasion', 'season', 'owner', 'rating', 'is_favorite', 'created_at']
    list_filter = ['occasion', 'season', 'rating', 'is_favorite', 'created_at', 'owner']
    search_fields = ['name', 'notes']
    filter_horizontal = ['garments']
    readonly_fields = ['created_at', 'updated_at', 'garment_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'owner', 'garments', 'garment_preview')
        }),
        ('Details', {
            'fields': ('occasion', 'season', 'weather', 'notes')
        }),
        ('Rating & Feedback', {
            'fields': ('rating', 'is_favorite', 'times_worn', 'last_worn')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def garment_count(self, obj):
        count = obj.garments.count()
        return f"{count} item{'s' if count != 1 else ''}"
    garment_count.short_description = "Items"
    
    def garment_preview(self, obj):
        garments = obj.garments.all()[:5]  # Show first 5 garments
        html = ""
        for garment in garments:
            if garment.image:
                html += format_html(
                    '<img src="{}" title="{}" style="width: 40px; height: 40px; object-fit: cover; margin: 2px; border-radius: 4px;" />',
                    garment.image.url,
                    garment.name
                )
        if obj.garments.count() > 5:
            html += f"<br><small>+{obj.garments.count() - 5} more items</small>"
        return mark_safe(html) if html else "No garments"
    garment_preview.short_description = "Garment Preview"

@admin.register(LaundryItem)
class LaundryItemAdmin(admin.ModelAdmin):
    list_display = ['garment', 'garment_owner', 'wash_date', 'estimated_completion', 'is_completed', 'completion_date']
    list_filter = ['is_completed', 'wash_date', 'estimated_completion']
    search_fields = ['garment__name', 'garment__owner__username']
    readonly_fields = ['wash_date']
    actions = ['mark_completed']
    
    def garment_owner(self, obj):
        return obj.garment.owner.username if obj.garment.owner else "No owner"
    garment_owner.short_description = "Owner"
    
    def mark_completed(self, request, queryset):
        for item in queryset:
            item.complete_wash()
        self.message_user(request, f"{queryset.count()} laundry items marked as completed.")
    mark_completed.short_description = "Mark selected items as completed"

@admin.register(WearHistory)
class WearHistoryAdmin(admin.ModelAdmin):
    list_display = ['get_item_name', 'get_item_type', 'date_worn', 'occasion', 'rating']
    list_filter = ['date_worn', 'occasion', 'rating']
    search_fields = ['garment__name', 'outfit__name', 'occasion']
    readonly_fields = ['date_worn']
    
    def get_item_name(self, obj):
        if obj.garment:
            return obj.garment.name
        elif obj.outfit:
            return obj.outfit.name
        return "Unknown"
    get_item_name.short_description = "Item"
    
    def get_item_type(self, obj):
        if obj.garment:
            return "Garment"
        elif obj.outfit:
            return "Outfit"
        return "Unknown"
    get_item_type.short_description = "Type"

# Customize admin site
admin.site.site_header = "Garmently Administration"
admin.site.site_title = "Garmently Admin"
admin.site.index_title = "Welcome to Garmently Administration"
