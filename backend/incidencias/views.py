from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Incidencia
from .serializers import IncidenciaSerializer
from trabajadores.models import Trabajador


class IncidenciaViewSet(viewsets.ModelViewSet):
    queryset = Incidencia.objects.all()
    serializer_class = IncidenciaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar incidencias según el rol del usuario"""
        user = self.request.user
        
        if user.rol == 'guardia':
            # Guardias solo ven sus propias incidencias
            return Incidencia.objects.filter(reportado_por=user).order_by('-fecha_reporte')
        elif user.rol == 'supervisor':
            # Supervisores ven todas las incidencias
            return Incidencia.objects.all().order_by('-fecha_reporte')
        elif user.rol == 'rrhh':
            # RRHH ve todas las incidencias
            return Incidencia.objects.all().order_by('-fecha_reporte')
        
        return Incidencia.objects.none()
    
    @action(detail=False, methods=['post'])
    def crear_incidencia(self, request):
        """
        Crear una nueva incidencia
        Requiere: rut_trabajador (opcional), descripcion
        """
        rut = request.data.get('rut_trabajador', '').strip()
        descripcion = request.data.get('descripcion', '').strip()
        
        if not descripcion:
            return Response(
                {'error': 'La descripción es obligatoria'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar trabajador si se proporciona RUT
        trabajador = None
        if rut:
            try:
                trabajador = Trabajador.objects.get(rut=rut)
            except Trabajador.DoesNotExist:
                return Response(
                    {'error': f'No existe un trabajador con RUT {rut}'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Crear la incidencia
        incidencia = Incidencia.objects.create(
            trabajador=trabajador,
            descripcion=descripcion,
            reportado_por=request.user,
            fecha_reporte=timezone.now(),
            estado='pendiente'
        )
        
        serializer = self.get_serializer(incidencia)
        return Response({
            'message': 'Incidencia registrada exitosamente',
            'incidencia': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def mis_incidencias(self, request):
        """Obtener las incidencias reportadas por el usuario actual"""
        incidencias = Incidencia.objects.filter(
            reportado_por=request.user
        ).order_by('-fecha_reporte')[:10]
        
        serializer = self.get_serializer(incidencias, many=True)
        return Response(serializer.data)