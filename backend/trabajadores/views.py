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
    filterset_fields = ['sede', 'tipo_contrato', 'activo']  # ← CORREGIDO
    search_fields = ['rut', 'nombre', 'apellido_paterno', 'apellido_materno']  # ← CORREGIDO
    ordering_fields = ['apellido_paterno', 'nombre']  # ← CORREGIDO
    ordering = ['apellido_paterno', 'nombre']  # ← CORREGIDO