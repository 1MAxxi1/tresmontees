from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrabajadorViewSet

router = DefaultRouter()
router.register(r'', TrabajadorViewSet, basename='trabajador')

urlpatterns = [
    path('', include(router.urls)),
]