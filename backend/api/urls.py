from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('status/', views.api_status, name='api_status'),
    path('garments/', views.garments, name='garments'),
]