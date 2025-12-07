from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Trabajador
from .serializers import TrabajadorSerializer

class TrabajadorViewSet(viewsets.ModelViewSet):
    queryset = Trabajador.objects.all()
    serializer_class = TrabajadorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sucursal', 'tipo_contrato', 'is_active', 'area']
    search_fields = ['rut', 'nombre', 'apellido', 'email']
    ordering_fields = ['apellido', 'nombre', 'fecha_ingreso']
    ordering = ['apellido', 'nombre']