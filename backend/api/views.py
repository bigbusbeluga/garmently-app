from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.http import JsonResponse
from .models import Category, Garment, Outfit
from .serializers import CategorySerializer, GarmentSerializer, OutfitSerializer

@api_view(['GET'])
def hello_world(request):
    """
    Simple API endpoint to test connection between React and Django
    """
    data = {
        'message': 'Hello from Django Backend!',
        'status': 'success',
        'timestamp': '2025-10-07',
        's3_enabled': True
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
def api_status(request):
    """
    API status endpoint
    """
    return Response({
        'api': 'Garmently Backend',
        'version': '1.0.0',
        'status': 'running',
        'features': ['S3 Storage', 'Image Uploads', 'REST API']
    })

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class GarmentViewSet(ModelViewSet):
    queryset = Garment.objects.all()
    serializer_class = GarmentSerializer
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            garments = self.queryset.filter(category_id=category_id)
            serializer = self.get_serializer(garments, many=True)
            return Response(serializer.data)
        return Response({'error': 'category_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        favorites = self.queryset.filter(is_favorite=True)
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)

class OutfitViewSet(ModelViewSet):
    queryset = Outfit.objects.all()
    serializer_class = OutfitSerializer

# Legacy endpoint for compatibility
@api_view(['GET', 'POST'])
def garments(request):
    """
    Legacy garments endpoint for backward compatibility
    """
    if request.method == 'GET':
        garments = Garment.objects.all()
        serializer = GarmentSerializer(garments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GarmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
