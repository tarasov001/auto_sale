from django.db import models
from django.contrib.auth.models import User


class Car(models.Model):
    """Модель автомобиля"""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars')
    brand = models.CharField('Марка', max_length=50)
    model = models.CharField('Модель', max_length=50)
    year = models.PositiveIntegerField('Год выпуска')
    price = models.DecimalField('Цена', max_digits=12, decimal_places=2)
    mileage = models.PositiveIntegerField('Пробег (км)', default=0)
    description = models.TextField('Описание', blank=True)
    phone = models.CharField('Телефон', max_length=20)
    image = models.ImageField('Основное фото', upload_to='cars/%Y/%m/%d/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Автомобиль'
        verbose_name_plural = 'Автомобили'

    def __str__(self):
        return f'{self.brand} {self.model} ({self.year})'


class CarImage(models.Model):
    """Фотографии автомобиля"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField('Изображение', upload_to='cars/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']
        verbose_name = 'Фотография'
        verbose_name_plural = 'Фотографии'

    def __str__(self):
        return f'Фото для {self.car}'
