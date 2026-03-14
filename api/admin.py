from django.contrib import admin
from .models import Car, CarImage


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['brand', 'model', 'year', 'price', 'owner', 'created_at']
    list_filter = ['brand', 'year', 'created_at']
    search_fields = ['brand', 'model', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ['car', 'uploaded_at']
    list_filter = ['uploaded_at']
