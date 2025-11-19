from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib import messages
from django.db.models import Q, Count
from django.http import JsonResponse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from .models import Category, Garment, Outfit, LaundryItem, WearHistory
from .serializers import CategorySerializer, GarmentSerializer, OutfitSerializer
from .forms import (
    GarmentForm, OutfitForm, CategoryForm, LaundryForm, 
    QuickAddGarmentForm, SearchForm, CustomUserCreationForm
)

# ==================== WEB VIEWS (Django Templates) ====================

def homepage(request):
    """Landing page for the application"""
    if request.user.is_authenticated:
        return redirect('wardrobe')
    return render(request, 'api/landing.html')

@login_required
def dashboard(request):
    """User dashboard with overview"""
    user_garments = Garment.objects.filter(owner=request.user)
    
    context = {
        'total_garments': user_garments.count(),
        'clean_garments': user_garments.filter(status='clean').count(),
        'dirty_garments': user_garments.filter(status='dirty').count(),
        'favorite_garments': user_garments.filter(is_favorite=True).count(),
        'recent_garments': user_garments[:5],
        'recent_outfits': Outfit.objects.filter(owner=request.user)[:3],
        'laundry_items': LaundryItem.objects.filter(
            garment__owner=request.user, is_completed=False
        ).count()
    }
    return render(request, 'api/dashboard.html', context)

@login_required
def wardrobe(request):
    """Main wardrobe view"""
    garments = Garment.objects.filter(owner=request.user)
    categories = Category.objects.annotate(
        garment_count=Count('garment', filter=Q(garment__owner=request.user))
    )
    
    # Search functionality
    search_form = SearchForm(request.GET)
    if search_form.is_valid():
        query = search_form.cleaned_data.get('query')
        category = search_form.cleaned_data.get('category')
        size = search_form.cleaned_data.get('size')
        season = search_form.cleaned_data.get('season')
        status = search_form.cleaned_data.get('status')
        
        if query:
            garments = garments.filter(
                Q(name__icontains=query) | 
                Q(color__icontains=query) | 
                Q(brand__icontains=query)
            )
        if category:
            garments = garments.filter(category=category)
        if size:
            garments = garments.filter(size=size)
        if season:
            garments = garments.filter(season=season)
        if status:
            garments = garments.filter(status=status)
    
    context = {
        'garments': garments,
        'categories': categories,
        'search_form': search_form,
        'quick_add_form': QuickAddGarmentForm()
    }
    return render(request, 'api/wardrobe.html', context)

@login_required
def add_garment(request):
    """Add new garment"""
    if request.method == 'POST':
        form = GarmentForm(request.POST, request.FILES)
        if form.is_valid():
            garment = form.save(commit=False)
            garment.owner = request.user
            garment.save()
            messages.success(request, f'{garment.name} added to your wardrobe!')
            return redirect('wardrobe')
    else:
        form = GarmentForm()
    
    return render(request, 'api/add_garment.html', {'form': form})

@login_required
def edit_garment(request, garment_id):
    """Edit existing garment"""
    garment = get_object_or_404(Garment, id=garment_id, owner=request.user)
    
    if request.method == 'POST':
        form = GarmentForm(request.POST, request.FILES, instance=garment)
        if form.is_valid():
            form.save()
            messages.success(request, f'{garment.name} updated successfully!')
            return redirect('wardrobe')
    else:
        form = GarmentForm(instance=garment)
    
    return render(request, 'api/edit_garment.html', {'form': form, 'garment': garment})

@login_required
def delete_garment(request, garment_id):
    """Delete garment"""
    garment = get_object_or_404(Garment, id=garment_id, owner=request.user)
    
    if request.method == 'POST':
        garment_name = garment.name
        garment.delete()
        messages.success(request, f'{garment_name} removed from your wardrobe!')
        return redirect('wardrobe')
    
    return render(request, 'api/delete_garment.html', {'garment': garment})

@login_required
def outfits(request):
    """View all outfits"""
    user_outfits = Outfit.objects.filter(owner=request.user)
    return render(request, 'api/outfits.html', {'outfits': user_outfits})

@login_required
def create_outfit(request):
    """Create new outfit"""
    if request.method == 'POST':
        form = OutfitForm(user=request.user, data=request.POST)
        if form.is_valid():
            outfit = form.save(commit=False)
            outfit.owner = request.user
            outfit.save()
            form.save_m2m()  # Save many-to-many relationships
            messages.success(request, f'Outfit "{outfit.name}" created!')
            return redirect('outfits')
    else:
        form = OutfitForm(user=request.user)
    
    return render(request, 'api/create_outfit.html', {'form': form})

@login_required
def laundry(request):
    """Laundry management"""
    dirty_garments = Garment.objects.filter(owner=request.user, status='dirty')
    in_laundry = LaundryItem.objects.filter(
        garment__owner=request.user, is_completed=False
    )
    
    if request.method == 'POST':
        # Quick add to laundry
        garment_ids = request.POST.getlist('garments')
        for garment_id in garment_ids:
            garment = get_object_or_404(Garment, id=garment_id, owner=request.user)
            if garment.status == 'dirty':
                LaundryItem.objects.create(garment=garment)
                garment.status = 'washing'
                garment.save()
        messages.success(request, f'{len(garment_ids)} items added to laundry!')
        return redirect('laundry')
    
    context = {
        'dirty_garments': dirty_garments,
        'in_laundry': in_laundry,
        'form': LaundryForm(user=request.user)
    }
    return render(request, 'api/laundry.html', context)

@login_required
def complete_laundry(request, laundry_id):
    """Mark laundry item as completed"""
    laundry_item = get_object_or_404(
        LaundryItem, id=laundry_id, garment__owner=request.user
    )
    laundry_item.complete_wash()
    messages.success(request, f'{laundry_item.garment.name} is now clean!')
    return redirect('laundry')

@login_required
def mixmatch(request):
    """Outfit suggestion and mix-match feature"""
    available_garments = Garment.objects.filter(
        owner=request.user, status='clean'
    )
    categories = Category.objects.filter(
        garment__owner=request.user
    ).distinct()
    
    context = {
        'garments': available_garments,
        'categories': categories,
        'suggested_outfit': None  # TODO: Add AI-based suggestions
    }
    return render(request, 'api/mixmatch.html', context)

@login_required
def wear_garment(request, garment_id):
    """Mark garment as worn"""
    garment = get_object_or_404(Garment, id=garment_id, owner=request.user)
    
    if garment.is_available():
        garment.mark_worn()
        garment.status = 'dirty'
        garment.save()
        
        # Create wear history
        WearHistory.objects.create(
            garment=garment,
            occasion=request.POST.get('occasion', ''),
            weather=request.POST.get('weather', '')
        )
        
        messages.success(request, f'{garment.name} marked as worn!')
    else:
        messages.error(request, 'This garment is not available to wear!')
    
    return redirect('wardrobe')

def signup(request):
    """User registration"""
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Welcome to Garmently!')
            return redirect('dashboard')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'registration/signup.html', {'form': form})

# ==================== API VIEWS (REST Framework) ====================

@api_view(['GET'])
def hello_world(request):
    """Simple API endpoint to test connection between React and Django"""
    data = {
        'message': 'Hello from Django Backend!',
        'status': 'success',
        'timestamp': '2025-11-19',
        's3_enabled': True,
        'features': ['Templates', 'API', 'S3', 'User Management']
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
def api_status(request):
    """API status endpoint"""
    return Response({
        'api': 'Garmently Backend',
        'version': '2.0.0',
        'status': 'running',
        'features': ['S3 Storage', 'Image Uploads', 'REST API', 'Web Interface', 'User Management']
    })

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class GarmentViewSet(ModelViewSet):
    queryset = Garment.objects.all()
    serializer_class = GarmentSerializer
    
    def get_queryset(self):
        """Filter garments by user if authenticated"""
        queryset = self.queryset
        if self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Set owner when creating garment"""
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            garments = self.get_queryset().filter(category_id=category_id)
            serializer = self.get_serializer(garments, many=True)
            return Response(serializer.data)
        return Response({'error': 'category_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        favorites = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def wear(self, request, pk=None):
        """Mark garment as worn"""
        garment = self.get_object()
        if garment.is_available():
            garment.mark_worn()
            garment.status = 'dirty'
            garment.save()
            return Response({'message': f'{garment.name} marked as worn'})
        return Response({'error': 'Garment not available'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class OutfitViewSet(ModelViewSet):
    queryset = Outfit.objects.all()
    serializer_class = OutfitSerializer
    
    def get_queryset(self):
        """Filter outfits by user if authenticated"""
        queryset = self.queryset
        if self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Set owner when creating outfit"""
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            serializer.save()

# Legacy endpoint for compatibility
@api_view(['GET', 'POST'])
def garments(request):
    """Legacy garments endpoint for backward compatibility"""
    if request.method == 'GET':
        garments = Garment.objects.all()
        if request.user.is_authenticated:
            garments = garments.filter(owner=request.user)
        serializer = GarmentSerializer(garments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GarmentSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.is_authenticated:
                serializer.save(owner=request.user)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
