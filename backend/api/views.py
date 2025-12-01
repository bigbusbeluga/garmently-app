from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Q, Count
from django.http import JsonResponse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
import os
import json
from openai import OpenAI
from .models import Category, Garment, Outfit, LaundryItem, WearHistory, EmailVerification
from .serializers import (
    CategorySerializer, GarmentSerializer, OutfitSerializer,
    UserSerializer, RegisterSerializer, LoginSerializer
)
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
    }
    return render(request, 'api/mixmatch.html', context)

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

# Email Verification Endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """Send verification code to email"""
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate verification code
    code = EmailVerification.generate_code()
    
    # Delete old verification codes for this email
    EmailVerification.objects.filter(email=email).delete()
    
    # Create new verification code
    verification = EmailVerification.objects.create(email=email, code=code)
    
    # Send email
    try:
        subject = 'Garmently - Email Verification Code'
        message = f'''
Hello!

Your verification code for Garmently is: {code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Garmently Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Verification code sent successfully',
            'email': email
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        # Still save the code so user can try again or we can implement retry logic
        # Still save the code so user can try again or we can implement retry logic
        return Response({
            'error': 'Email service temporarily unavailable. Please try again in a moment.',
            'detail': str(e) if settings.DEBUG else 'Email sending failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    """Verify the email verification code"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        verification = EmailVerification.objects.filter(
            email=email,
            code=code,
            is_verified=False
        ).latest('created_at')
        
        if verification.is_expired():
            return Response({'error': 'Verification code has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified
        verification.is_verified = True
        verification.save()
        
        return Response({
            'message': 'Email verified successfully',
            'verified': True
        }, status=status.HTTP_200_OK)
    
    except EmailVerification.DoesNotExist:
        return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Handle Google OAuth authentication"""
    from allauth.socialaccount.models import SocialAccount
    from django.contrib.auth.models import User
    import requests
    
    access_token = request.data.get('access_token')
    id_token = request.data.get('id_token') or request.data.get('credential')
    
    if not access_token and not id_token:
        return Response({'error': 'Google credential is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from django.conf import settings
        configured_client_id = (
            getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {})
            .get('google', {})
            .get('APP', {})
            .get('client_id')
        )
        allowed_audiences = set()
        if configured_client_id:
            allowed_audiences.add(configured_client_id)
        extra_audiences = os.getenv('GOOGLE_ALLOWED_AUDIENCES')
        if extra_audiences:
            allowed_audiences.update([
                aud.strip() for aud in extra_audiences.split(',') if aud.strip()
            ])

        # When the frontend provides an access token we can hit the standard userinfo endpoint.
        if access_token:
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            if google_response.status_code != 200:
                return Response({'error': 'Invalid Google credential'}, status=status.HTTP_400_BAD_REQUEST)

            user_info = google_response.json()

            audience = user_info.get('aud') or user_info.get('audience')
            if allowed_audiences and audience and audience not in allowed_audiences:
                return Response(
                    {
                        'error': 'Google credential does not match any allowed client',
                        'detail': f'aud={audience}'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            try:
                from google.oauth2 import id_token as google_id_token
                from google.auth.transport import requests as google_auth_requests
            except ImportError:
                return Response(
                    {'error': 'Google authentication library is not available on the server'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            try:
                id_info = google_id_token.verify_oauth2_token(
                    id_token,
                    google_auth_requests.Request(),
                    None  # We validate the audience manually below to allow multiple IDs.
                )
            except ValueError as exc:
                return Response(
                    {
                        'error': 'Invalid Google credential',
                        'detail': str(exc)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not id_info.get('email_verified', True):
                return Response({'error': 'Google account email is not verified'}, status=status.HTTP_400_BAD_REQUEST)

            audience = id_info.get('aud')
            if allowed_audiences and audience not in allowed_audiences:
                return Response(
                    {
                        'error': 'Google credential does not match any allowed client',
                        'detail': f'aud={audience}'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_info = {
                'email': id_info.get('email'),
                'sub': id_info.get('sub'),
                'given_name': id_info.get('given_name', ''),
                'family_name': id_info.get('family_name', ''),
                'picture': id_info.get('picture', ''),
            }

        email = user_info.get('email')
        google_id = user_info.get('sub')
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        picture = user_info.get('picture', '')
        
        if not email or not google_id:
            return Response({'error': 'Email or Google ID not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists with this email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user
            username = email.split('@')[0]
            # Make username unique if it already exists
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            user.set_unusable_password()  # Google users don't have passwords
            user.save()
        
        # Get or create social account
        social_account, created = SocialAccount.objects.get_or_create(
            provider='google',
            uid=google_id,
            defaults={'user': user, 'extra_data': user_info}
        )
        
        if not created and social_account.user != user:
            # Link social account to this user
            social_account.user = user
            social_account.extra_data = user_info
            social_account.save()
        
        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile_picture': picture
            }
        }, status=status.HTTP_200_OK)
    
    except requests.RequestException as e:
        return Response({
            'error': 'Failed to verify Google token',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': 'Authentication failed',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Authentication Endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    print(f"Registration attempt with data: {request.data}")  # Debug log
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            print(f"User registered successfully: {user.username}")  # Debug log
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error during user creation: {str(e)}")  # Debug log
            return Response({
                'error': str(e),
                'detail': 'Failed to create user'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    print(f"Validation errors: {serializer.errors}")  # Debug log
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user and return token"""
    print(f"Login attempt with data: {request.data}")  # Debug log
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username_or_email = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Try to find user by email first, then by username
        user = None
        if '@' in username_or_email:
            # It's an email
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            # It's a username
            user = authenticate(username=username_or_email, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            print(f"User logged in successfully: {user.username}")  # Debug log
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        print(f"Authentication failed for: {username_or_email}")  # Debug log
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    print(f"Login validation errors: {serializer.errors}")  # Debug log
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by deleting token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'})
    except:
        return Response({'error': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get or update current authenticated user"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Both old_password and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {'error': 'Old password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'})

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
    permission_classes = [AllowAny]  # Categories can be viewed by anyone

class GarmentViewSet(ModelViewSet):
    queryset = Garment.objects.all()
    serializer_class = GarmentSerializer
    permission_classes = [IsAuthenticated]  # Require authentication
    
    def get_queryset(self):
        """Filter garments by authenticated user only"""
        return self.queryset.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        """Set owner when creating garment"""
        serializer.save(owner=self.request.user)
    
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
    permission_classes = [IsAuthenticated]  # Require authentication
    
    def get_queryset(self):
        """Filter outfits by authenticated user only"""
        return self.queryset.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        """Set owner when creating outfit"""
        serializer.save(owner=self.request.user)

# Legacy endpoint for compatibility
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def garments(request):
    """Legacy garments endpoint for backward compatibility (requires authentication)"""
    if request.method == 'GET':
        garments = Garment.objects.filter(owner=request.user)
        serializer = GarmentSerializer(garments, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GarmentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# AI Outfit Recommendation Endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_outfit_recommendation(request):
    """Generate AI-powered outfit recommendations based on occasion/theme"""
    try:
        theme = request.data.get('theme', 'casual day')
        weather = request.data.get('weather', 'moderate')
        
        # Get user's wardrobe
        garments = Garment.objects.filter(owner=request.user, status='clean')
        
        if garments.count() == 0:
            return Response({
                'error': 'No clean garments available in your wardrobe'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Build wardrobe description for AI
        wardrobe_items = []
        for g in garments:
            wardrobe_items.append({
                'id': g.id,
                'name': g.name,
                'category': g.category.name if g.category else 'Uncategorized',
                'color': g.color or 'unknown',
                'size': g.size or 'unknown',
                'brand': g.brand or 'unknown'
            })
        
        # Use OpenAI API for recommendations (fallback to rule-based if no API key)
        api_key = os.getenv('OPENAI_API_KEY')
        
        if api_key:
            try:
                client = OpenAI(api_key=api_key)
                prompt = f"""You are a fashion stylist assistant. Based on the following wardrobe items, recommend 3 complete outfits for the theme: "{theme}" with weather: "{weather}".

Wardrobe items:
{json.dumps(wardrobe_items, indent=2)}

IMPORTANT RULES:
- Pick ONLY ONE item from each category per outfit
- Do not repeat the same category multiple times in one outfit
- Create balanced, complete outfits

For each outfit, provide:
1. A creative outfit name
2. List of garment IDs to use (ONE per category only)
3. Brief reasoning why this combination works
4. Style tip

Return JSON format:
{{
  "outfits": [
    {{
      "name": "outfit name",
      "garment_ids": [1, 2, 3],
      "reasoning": "why it works",
      "style_tip": "additional tip"
    }}
  ]
}}"""
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a professional fashion stylist who creates practical, stylish outfit recommendations."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.8,
                    response_format={ "type": "json_object" }
                )
                
                recommendations = json.loads(response.choices[0].message.content)
                return Response(recommendations)
                
            except Exception as e:
                print(f"OpenAI API error: {e}")
                # Fall through to rule-based recommendation
        
        # Rule-based fallback recommendation
        import random
        
        # Group garments by category
        categories = {}
        for g in garments:
            cat_name = g.category.name if g.category else 'Uncategorized'
            if cat_name not in categories:
                categories[cat_name] = []
            categories[cat_name].append(g)
        
        recommendations = {
            "outfits": []
        }
        
        # Generate 3 outfit combinations, picking ONE item from each category
        for i in range(3):
            outfit = {
                "name": f"{theme.title()} Look {i+1}",
                "garment_ids": [],
                "reasoning": f"A curated combination perfect for {theme}",
                "style_tip": "Each outfit uses one item per category for a balanced look!"
            }
            
            # Pick ONE random item from each category
            for cat_name, items in categories.items():
                if items:
                    chosen = random.choice(items)
                    outfit["garment_ids"].append(chosen.id)
            
            if outfit["garment_ids"]:
                recommendations["outfits"].append(outfit)
        
        if not recommendations["outfits"]:
            recommendations["outfits"].append({
                "name": f"Simple {theme.title()} Outfit",
                "garment_ids": [g.id for g in garments[:3]],
                "reasoning": "A basic combination from your available items",
                "style_tip": "Mix and match to find your perfect look!"
            })
        
        return Response(recommendations)
        
    except Exception as e:
        return Response({
            'error': f'Failed to generate recommendations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
