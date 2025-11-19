from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets (API endpoints)
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'garments-api', views.GarmentViewSet)
router.register(r'outfits', views.OutfitViewSet)

# API URLs
api_urlpatterns = [
    # API Router URLs
    path('api/', include(router.urls)),
    
    # Legacy endpoints
    path('api/hello/', views.hello_world, name='hello_world'),
    path('api/status/', views.api_status, name='api_status'),
    path('api/garments/', views.garments, name='garments'),
]

# Template-based URLs (Web interface)
web_urlpatterns = [
    # Authentication
    path('signup/', views.signup, name='signup'),
    
    # Main pages
    path('', views.homepage, name='homepage'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('wardrobe/', views.wardrobe, name='wardrobe'),
    
    # Garment management
    path('add/', views.add_garment, name='add_garment'),
    path('garments/<int:garment_id>/edit/', views.edit_garment, name='edit_garment'),
    path('garments/<int:garment_id>/delete/', views.delete_garment, name='delete_garment'),
    path('garments/<int:garment_id>/wear/', views.wear_garment, name='wear_garment'),
    
    # Outfits
    path('outfits/', views.outfits, name='outfits'),
    path('outfits/create/', views.create_outfit, name='create_outfit'),
    
    # Laundry
    path('laundry/', views.laundry, name='laundry'),
    path('laundry/<int:laundry_id>/complete/', views.complete_laundry, name='complete_laundry'),
    
    # Mix & Match
    path('mixmatch/', views.mixmatch, name='mixmatch'),
]

# Combine all URLs
urlpatterns = api_urlpatterns + web_urlpatterns