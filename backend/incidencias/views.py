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
            # Guardias solo ven sus propias incidencias (CORREGIDO: guardia en lugar de reportado_por)
            return Incidencia.objects.filter(guardia=user).order_by('-fecha_reporte')
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
        Crear una nueva incidencia con tipo y prioridad.
        
        POST /api/incidencias/crear_incidencia/
        Body: {
            "tipo": "qr_no_funciona",
            "rut_trabajador": "12345678-9" (opcional),
            "codigo_caja": "CAJA-001" (opcional),
            "descripcion": "...",
            "imagen": file (opcional)
        }
        """
        tipo = request.data.get('tipo', 'otro')
        rut = request.data.get('rut_trabajador', '').strip()
        codigo_caja = request.data.get('codigo_caja', '').strip()
        descripcion = request.data.get('descripcion', '').strip()
        imagen = request.FILES.get('imagen')
        
        if not descripcion:
            return Response(
                {'error': 'La descripción es obligatoria'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar tipo
        tipos_validos = [choice[0] for choice in Incidencia.TIPO_CHOICES]
        if tipo not in tipos_validos:
            return Response(
                {'error': f'Tipo inválido. Opciones: {", ".join(tipos_validos)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar trabajador si se proporciona RUT
        trabajador = None
        rut_manual = None
        if rut:
            try:
                trabajador = Trabajador.objects.get(rut=rut, activo=True)
            except Trabajador.DoesNotExist:
                # Si no existe, guardar el RUT manualmente
                rut_manual = rut
        
        # Validar caja si se proporciona código
        caja_codigo = None
        if codigo_caja:
            try:
                from cajas.models import Caja
                caja = Caja.objects.get(codigo=codigo_caja, activa=True)
                caja_codigo = caja.codigo
            except:
                caja_codigo = codigo_caja  # Guardar como texto si no existe
        
        # Crear la incidencia
        incidencia = Incidencia.objects.create(
            trabajador=trabajador,
            descripcion=descripcion,
            guardia=request.user,
            tipo=tipo,
            rut_trabajador_manual=rut_manual or '',
            estado='pendiente',
            imagen_evidencia=imagen
        )
        
        # Agregar código de caja en descripción si existe
        if caja_codigo:
            incidencia.descripcion = f"Caja: {caja_codigo}\n{incidencia.descripcion}"
            incidencia.save()
        
        serializer = self.get_serializer(incidencia)
        return Response({
            'message': 'Incidencia registrada exitosamente',
            'incidencia': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def mis_incidencias(self, request):
        """Obtener las incidencias reportadas por el usuario actual"""
        # CORREGIDO: guardia en lugar de reportado_por
        incidencias = Incidencia.objects.filter(
            guardia=request.user
        ).order_by('-fecha_reporte')[:10]
        
        serializer = self.get_serializer(incidencias, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def tipos_incidencia(self, request):
        """
        Obtener lista de tipos de incidencia disponibles.
        
        GET /api/incidencias/tipos_incidencia/
        """
        tipos = [
            {
                'value': tipo[0],
                'label': tipo[1],
                'emoji': self._get_emoji_tipo(tipo[0])
            }
            for tipo in Incidencia.TIPO_CHOICES
        ]
        return Response(tipos)
    
    def _get_emoji_tipo(self, tipo):
        """Retorna emoji según tipo de incidencia"""
        emojis = {
            'qr_no_funciona': '📱',
            'trabajador_no_registrado': '👤',
            'caja_danada': '📦',
            'stock_insuficiente': '⚠️',
            'trabajador_sin_beneficio': '🚫',
            'incompatibilidad_contrato': '📋',
            'sistema_caido': '🔴',
            'otro': '💬'
        }
        return emojis.get(tipo, '❓')
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener incidencias pendientes (para supervisores)"""
        if request.user.rol not in ['supervisor', 'rrhh']:
            return Response(
                {'error': 'No tiene permisos para ver esta información'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incidencias = Incidencia.objects.filter(
            estado='pendiente'
        ).order_by('-fecha_reporte')
        
        serializer = self.get_serializer(incidencias, many=True)
        return Response({
            'count': incidencias.count(),
            'incidencias': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        """Resolver una incidencia (solo supervisores)"""
        if request.user.rol != 'supervisor':
            return Response(
                {'error': 'Solo supervisores pueden resolver incidencias'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incidencia = self.get_object()
        solucion = request.data.get('solucion', '').strip()
        
        if not solucion:
            return Response(
                {'error': 'Debe proporcionar una solución'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        incidencia.resolver(request.user, solucion)
        
        serializer = self.get_serializer(incidencia)
        return Response({
            'message': 'Incidencia resuelta exitosamente',
            'incidencia': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechazar una incidencia (solo supervisores)"""
        if request.user.rol != 'supervisor':
            return Response(
                {'error': 'Solo supervisores pueden rechazar incidencias'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incidencia = self.get_object()
        motivo = request.data.get('motivo', '').strip()
        
        if not motivo:
            return Response(
                {'error': 'Debe proporcionar un motivo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        incidencia.rechazar(request.user, motivo)
        
        serializer = self.get_serializer(incidencia)
        return Response({
            'message': 'Incidencia rechazada',
            'incidencia': serializer.data
        })