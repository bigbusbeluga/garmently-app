from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse

@api_view(['GET'])
def hello_world(request):
    """
    Simple API endpoint to test connection between React and Django
    """
    data = {
        'message': 'Hello from Django Backend!',
        'status': 'success',
        'timestamp': '2025-10-05'
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
        'status': 'running'
    })

@api_view(['GET', 'POST'])
def garments(request):
    """
    Sample garments endpoint
    """
    if request.method == 'GET':
        # Sample garment data
        sample_garments = [
            {
                'id': 1,
                'name': 'Classic T-Shirt',
                'type': 'shirt',
                'color': 'blue',
                'size': 'M',
                'price': 29.99
            },
            {
                'id': 2,
                'name': 'Denim Jeans',
                'type': 'pants',
                'color': 'dark blue',
                'size': 'L',
                'price': 79.99
            },
            {
                'id': 3,
                'name': 'Summer Dress',
                'type': 'dress',
                'color': 'floral',
                'size': 'S',
                'price': 59.99
            }
        ]
        return Response(sample_garments)
    
    elif request.method == 'POST':
        # Handle creating new garment
        garment_data = request.data
        # In a real app, you'd save this to database
        return Response({
            'message': 'Garment created successfully',
            'data': garment_data
        }, status=status.HTTP_201_CREATED)
