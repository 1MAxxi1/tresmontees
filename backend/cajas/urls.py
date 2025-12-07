from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CajaViewSet

router = DefaultRouter()
router.register(r'', CajaViewSet, basename='caja')

urlpatterns = [
    path('', include(router.urls)),
]