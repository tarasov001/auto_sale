from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserViewSet, CarViewSet, CarImageViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('cars', CarViewSet, basename='car')
router.register('car-images', CarImageViewSet, basename='car-image')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
