from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'garments-api', views.GarmentViewSet)
router.register(r'outfits', views.OutfitViewSet)

urlpatterns = [
    # API Router URLs
    path('', include(router.urls)),
    
    # Legacy endpoints
    path('hello/', views.hello_world, name='hello_world'),
    path('status/', views.api_status, name='api_status'),
    path('garments/', views.garments, name='garments'),
]