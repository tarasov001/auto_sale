from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.models import User
from .models import Car, CarImage


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user


class CarImageSerializer(serializers.ModelSerializer):
    """Сериализатор фотографий"""
    image = serializers.SerializerMethodField()

    class Meta:
        model = CarImage
        fields = ['id', 'image', 'uploaded_at']

    def get_image(self, obj):
        # Возвращаем полный URL для изображения
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        # Fallback к настройке MEDIA_FULL_URL
        if obj.image:
            return settings.MEDIA_FULL_URL + str(obj.image)
        return None


class CarSerializer(serializers.ModelSerializer):
    """Сериализатор автомобиля"""
    images = CarImageSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Car
        fields = [
            'id', 'owner', 'owner_username', 'brand', 'model', 'year',
            'price', 'mileage', 'description', 'phone', 'image', 'images',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner']

    def get_image(self, obj):
        request = self.context.get('request')
        # Проверяем основное фото (используем bool для безопасной проверки)
        try:
            if obj.image:
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return settings.MEDIA_FULL_URL + str(obj.image)
        except (ValueError, AttributeError):
            pass
        # Если нет основного фото, берём первое из галереи
        first_image = obj.images.all().first()
        if first_image and first_image.image:
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return settings.MEDIA_FULL_URL + str(first_image.image)
        return None


class CarCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания автомобиля"""
    id = serializers.IntegerField(read_only=True)
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Car
        fields = ['id', 'brand', 'model', 'year', 'price', 'mileage', 'description', 'phone', 'images']

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        car = Car.objects.create(**validated_data)
        
        # Сохраняем изображения
        for image_data in images_data:
            CarImage.objects.create(car=car, image=image_data)
        
        return car
