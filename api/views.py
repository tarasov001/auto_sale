from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Car, CarImage
from .serializers import (
    UserSerializer, CarSerializer, CarCreateSerializer, CarImageSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для регистрации пользователей"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post']  # Только регистрация


class CarViewSet(viewsets.ModelViewSet):
    """ViewSet для автомобилей"""
    from rest_framework.parsers import MultiPartParser, FormParser
    
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CarCreateSerializer
        return CarSerializer

    def get_queryset(self):
        queryset = Car.objects.select_related('owner').prefetch_related('images').all()

        # Фильтры
        brand = self.request.query_params.get('brand')
        model = self.request.query_params.get('model')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')

        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if model:
            queryset = queryset.filter(model__icontains=model)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if min_year:
            queryset = queryset.filter(year__gte=min_year)
        if max_year:
            queryset = queryset.filter(year__lte=max_year)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = CarSerializer(queryset, many=True, context={'request': request})
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CarSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Необходимо войти в систему для создания объявления')
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def my(self, request):
        """Автомобили текущего пользователя"""
        if not request.user.is_authenticated:
            return Response([])
        cars = Car.objects.filter(owner=request.user)
        serializer = CarSerializer(cars, many=True, context={'request': request})
        return Response(serializer.data)


class CarImageViewSet(viewsets.ModelViewSet):
    """ViewSet для фотографий автомобилей"""
    from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
    
    queryset = CarImage.objects.all()
    serializer_class = CarImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        car_id = self.request.data.get('car_id')
        if not car_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'car_id': 'Не указан car_id'})
        car = Car.objects.get(id=car_id, owner=self.request.user)
        serializer.save(car=car)
