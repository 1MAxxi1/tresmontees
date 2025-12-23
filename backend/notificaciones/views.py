from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count

from .models import Notificacion
from .serializers import NotificacionSerializer, EstadisticasNotificacionesSerializer


class NotificacionesListView(APIView):
    """Listar notificaciones con filtros y por sucursal del usuario"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Obtener notificaciones (globales o del usuario)
        notificaciones = Notificacion.objects.filter(
            Q(usuario_destinatario=request.user) | Q(usuario_destinatario__isnull=True)
        )
        
        # FILTRO POR SUCURSAL DEL USUARIO
        # Mapear código de sucursal a nombre completo
        SUCURSAL_MAP = {
            'casablanca': 'Casablanca',
            'valparaiso_bif': 'Valparaíso – Planta BIF',
            'valparaiso_bic': 'Valparaíso – Planta BIC',
        }
        
        sucursal_usuario = getattr(request.user, 'sucursal', None)
        if sucursal_usuario:
            sucursal_nombre = SUCURSAL_MAP.get(sucursal_usuario, sucursal_usuario)
            
            # Filtrar notificaciones que:
            # 1. No tienen datos_extra (son globales)
            # 2. Tienen datos_extra pero no especifican sucursal
            # 3. Tienen datos_extra con la sucursal del usuario
            notificaciones = notificaciones.filter(
                Q(datos_extra={}) |  # Sin datos extra (globales)
                Q(datos_extra__sucursal__isnull=True) |  # Sin sucursal específica
                Q(datos_extra__sucursal=sucursal_nombre) |  # Sucursal coincide (nombre completo)
                Q(datos_extra__sucursal=sucursal_usuario)  # Sucursal coincide (código)
            )
        
        # Filtrar por tipo
        tipo = request.query_params.get('tipo', None)
        if tipo:
            notificaciones = notificaciones.filter(tipo=tipo)
        
        # Filtrar por leída/no leída
        leida = request.query_params.get('leida', None)
        if leida is not None:
            leida_bool = leida.lower() in ['true', '1', 'yes']
            notificaciones = notificaciones.filter(leida=leida_bool)
        
        # Filtrar por prioridad
        prioridad = request.query_params.get('prioridad', None)
        if prioridad:
            notificaciones = notificaciones.filter(prioridad=prioridad)
        
        # Ordenar
        notificaciones = notificaciones.order_by('-creado_en')
        
        # Limitar cantidad
        limit = request.query_params.get('limit', None)
        if limit:
            try:
                notificaciones = notificaciones[:int(limit)]
            except ValueError:
                pass
        
        serializer = NotificacionSerializer(notificaciones, many=True)
        return Response(serializer.data)


class MarcarComoLeidaView(APIView):
    """Marcar una notificación como leída"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        notificacion = get_object_or_404(Notificacion, pk=pk)
        notificacion.marcar_como_leida()
        
        serializer = NotificacionSerializer(notificacion)
        return Response({
            'message': 'Notificación marcada como leída',
            'notificacion': serializer.data
        })


class MarcarTodasLeidasView(APIView):
    """Marcar todas las notificaciones como leídas (filtradas por sucursal)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Marcar todas las no leídas del usuario
        notificaciones = Notificacion.objects.filter(
            Q(usuario_destinatario=request.user) | Q(usuario_destinatario__isnull=True),
            leida=False
        )
        
        # FILTRO POR SUCURSAL
        SUCURSAL_MAP = {
            'casablanca': 'Casablanca',
            'valparaiso_bif': 'Valparaíso – Planta BIF',
            'valparaiso_bic': 'Valparaíso – Planta BIC',
        }
        
        sucursal_usuario = getattr(request.user, 'sucursal', None)
        if sucursal_usuario:
            sucursal_nombre = SUCURSAL_MAP.get(sucursal_usuario, sucursal_usuario)
            notificaciones = notificaciones.filter(
                Q(datos_extra={}) |
                Q(datos_extra__sucursal__isnull=True) |
                Q(datos_extra__sucursal=sucursal_nombre) |
                Q(datos_extra__sucursal=sucursal_usuario)
            )
        
        count = notificaciones.count()
        
        from django.utils import timezone
        notificaciones.update(leida=True, leida_en=timezone.now())
        
        return Response({
            'message': f'{count} notificaciones marcadas como leídas',
            'total': count
        })


class EliminarNotificacionView(APIView):
    """Eliminar una notificación"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, pk):
        notificacion = get_object_or_404(Notificacion, pk=pk)
        notificacion.delete()
        
        return Response({
            'message': 'Notificación eliminada correctamente'
        }, status=status.HTTP_200_OK)


class EstadisticasNotificacionesView(APIView):
    """Obtener estadísticas de notificaciones (filtradas por sucursal)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Notificaciones del usuario
        notificaciones = Notificacion.objects.filter(
            Q(usuario_destinatario=request.user) | Q(usuario_destinatario__isnull=True)
        )
        
        # FILTRO POR SUCURSAL
        SUCURSAL_MAP = {
            'casablanca': 'Casablanca',
            'valparaiso_bif': 'Valparaíso – Planta BIF',
            'valparaiso_bic': 'Valparaíso – Planta BIC',
        }
        
        sucursal_usuario = getattr(request.user, 'sucursal', None)
        if sucursal_usuario:
            sucursal_nombre = SUCURSAL_MAP.get(sucursal_usuario, sucursal_usuario)
            notificaciones = notificaciones.filter(
                Q(datos_extra={}) |
                Q(datos_extra__sucursal__isnull=True) |
                Q(datos_extra__sucursal=sucursal_nombre) |
                Q(datos_extra__sucursal=sucursal_usuario)
            )
        
        # Contar totales
        total = notificaciones.count()
        no_leidas = notificaciones.filter(leida=False).count()
        
        # Contar por tipo
        por_tipo = {}
        for tipo, nombre in Notificacion.TIPO_CHOICES:
            count = notificaciones.filter(tipo=tipo).count()
            if count > 0:
                por_tipo[tipo] = {
                    'nombre': nombre,
                    'count': count,
                    'no_leidas': notificaciones.filter(tipo=tipo, leida=False).count()
                }
        
        # Contar por prioridad
        por_prioridad = {}
        for prioridad, nombre in Notificacion.PRIORIDAD_CHOICES:
            count = notificaciones.filter(prioridad=prioridad).count()
            if count > 0:
                por_prioridad[prioridad] = {
                    'nombre': nombre,
                    'count': count
                }
        
        data = {
            'total': total,
            'no_leidas': no_leidas,
            'por_tipo': por_tipo,
            'por_prioridad': por_prioridad
        }
        
        serializer = EstadisticasNotificacionesSerializer(data)
        return Response(serializer.data)


class LimpiarNotificacionesAntiguasView(APIView):
    """Limpiar notificaciones leídas antiguas (filtradas por sucursal)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from django.utils import timezone
        from datetime import timedelta
        
        # Eliminar notificaciones leídas de más de 30 días
        fecha_limite = timezone.now() - timedelta(days=30)
        
        notificaciones = Notificacion.objects.filter(
            Q(usuario_destinatario=request.user) | Q(usuario_destinatario__isnull=True),
            leida=True,
            leida_en__lt=fecha_limite
        )
        
        # FILTRO POR SUCURSAL
        SUCURSAL_MAP = {
            'casablanca': 'Casablanca',
            'valparaiso_bif': 'Valparaíso – Planta BIF',
            'valparaiso_bic': 'Valparaíso – Planta BIC',
        }
        
        sucursal_usuario = getattr(request.user, 'sucursal', None)
        if sucursal_usuario:
            sucursal_nombre = SUCURSAL_MAP.get(sucursal_usuario, sucursal_usuario)
            notificaciones = notificaciones.filter(
                Q(datos_extra={}) |
                Q(datos_extra__sucursal__isnull=True) |
                Q(datos_extra__sucursal=sucursal_nombre) |
                Q(datos_extra__sucursal=sucursal_usuario)
            )
        
        count = notificaciones.count()
        notificaciones.delete()
        
        return Response({
            'message': f'{count} notificaciones antiguas eliminadas',
            'total': count
        })