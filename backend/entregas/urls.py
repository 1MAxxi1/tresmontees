from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EntregaViewSet

router = DefaultRouter()
router.register(r'', EntregaViewSet, basename='entrega')

urlpatterns = [
    path('', include(router.urls)),
]