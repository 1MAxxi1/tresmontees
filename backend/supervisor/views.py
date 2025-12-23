from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone

from incidencias.models import Incidencia
from .serializers import (
    IncidenciaSupervisorSerializer,
    ActualizarIncidenciaSerializer,
    SupervisorStatsSerializer
)


class SupervisorInfoView(APIView):
    """Obtener información del supervisor logueado"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'nombre': user.first_name,
            'apellidos': user.last_name,
            'cargo': 'Supervisor de Operaciones',
            'email': user.email,
            'rol': user.rol
        })


class SupervisorEstadisticasView(APIView):
    """Obtener estadísticas de incidencias"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        incidencias = Incidencia.objects.all()
        
        stats = {
            'total': incidencias.count(),
            'pendientes': incidencias.filter(estado='pendiente').count(),
            'aprobados': incidencias.filter(estado='aprobado').count(),
            'rechazados': incidencias.filter(estado='rechazado').count(),
        }
        
        serializer = SupervisorStatsSerializer(stats)
        return Response(serializer.data)


class IncidenciasListView(APIView):
    """Listar todas las incidencias con filtros"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        incidencias = Incidencia.objects.select_related(
            'trabajador', 'guardia'
        ).order_by('-fecha_reporte')
        
        # Filtro por estado
        estado = request.query_params.get('estado', None)
        if estado:
            incidencias = incidencias.filter(estado=estado)
        
        # Búsqueda por texto
        busqueda = request.query_params.get('busqueda', None)
        if busqueda:
            incidencias = incidencias.filter(
                Q(descripcion__icontains=busqueda) |
                Q(tipo__icontains=busqueda) |
                Q(trabajador__rut__icontains=busqueda) |
                Q(trabajador__nombre__icontains=busqueda) |
                Q(trabajador__apellido_paterno__icontains=busqueda) |
                Q(solucion__icontains=busqueda)
            )
        
        serializer = IncidenciaSupervisorSerializer(incidencias, many=True)
        return Response({
            'data': serializer.data,
            'total': incidencias.count()
        })


class ActualizarIncidenciaView(APIView):
    """Actualizar estado de una incidencia (aprobar/rechazar)"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        incidencia = get_object_or_404(Incidencia, pk=pk)
        print("📥 DATOS RECIBIDOS:", request.data)
        
        serializer = ActualizarIncidenciaSerializer(data=request.data)
        
        if not serializer.is_valid():
            print("❌ ERROR DE VALIDACIÓN:", serializer.errors)
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
          )
        print("✅ DATOS VALIDADOS:", serializer.validated_data)
        
        # Actualizar incidencia
        incidencia.estado = serializer.validated_data['estado']
        incidencia.solucion = serializer.validated_data['solucion']
        incidencia.fecha_resolucion = timezone.now()
        incidencia.save()
        
        return Response({
            'message': 'Incidencia actualizada correctamente',
            'incidencia': IncidenciaSupervisorSerializer(incidencia).data
        })


class ReabrirIncidenciaView(APIView):
    """Reabrir una incidencia cerrada"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        incidencia = get_object_or_404(Incidencia, pk=pk)
        
        if incidencia.estado == 'pendiente':
            return Response(
                {'error': 'La incidencia ya está pendiente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        incidencia.estado = 'pendiente'
        incidencia.solucion = ''
        incidencia.fecha_resolucion = None
        incidencia.save()
        
        return Response({
            'message': 'Incidencia reabierta correctamente',
            'incidencia': IncidenciaSupervisorSerializer(incidencia).data
        })


class IncidenciaDetalleView(APIView):
    """Obtener detalle de una incidencia"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        incidencia = get_object_or_404(
            Incidencia.objects.select_related('trabajador', 'guardia'),
            pk=pk
        )
        
        serializer = IncidenciaSupervisorSerializer(incidencia)
        return Response(serializer.data)