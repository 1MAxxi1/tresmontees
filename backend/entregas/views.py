from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Entrega
from .serializers import (
    EntregaSerializer, 
    EntregaListSerializer,
    EntregaCreateSerializer,
    ValidarSupervisorSerializer
)
from trabajadores.models import Trabajador
from trabajadores.serializers import TrabajadorSerializer
from cajas.models import Caja
from cajas.serializers import CajaSerializer

class EntregaViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de entregas.
    
    Endpoints principales:
    - list: Lista todas las entregas (con filtros)
    - create: Crea una nueva entrega
    - retrieve: Detalle de una entrega
    - update: Actualiza una entrega
    - partial_update: Actualización parcial
    - destroy: Elimina una entrega
    
    Endpoints personalizados:
    - mis_entregas_hoy: Entregas del guardia del día actual
    - estadisticas_guardia: Estadísticas del guardia
    - validar_trabajador: Valida RUT o QR de trabajador
    - validar_caja: Valida código o QR de caja
    - crear_entrega_completa: Flujo completo de entrega
    - validar_entrega: Supervisor valida entrega
    - entregas_pendientes_validacion: Entregas sin validar
    - reporte_diario: Reporte del día
    """
    
    queryset = Entrega.objects.select_related(
        'trabajador', 
        'caja', 
        'guardia', 
        'supervisor'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        'estado', 
        'guardia', 
        'trabajador', 
        'validado_supervisor',
        'caja__sucursal'
    ]
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'list':
            return EntregaListSerializer
        elif self.action == 'crear_entrega_completa':
            return EntregaCreateSerializer
        return EntregaSerializer
    
    def get_queryset(self):
        """
        Filtrar queryset según rol del usuario.
        Guardias solo ven sus entregas.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.rol == 'guardia':
            return queryset.filter(guardia=user)
        
        return queryset
    
    def perform_create(self, serializer):
        """Asignar automáticamente el guardia actual al crear entrega"""
        serializer.save(guardia=self.request.user)
    
    # ========== ENDPOINTS PERSONALIZADOS ==========
    
    @action(detail=False, methods=['get'])
    def mis_entregas_hoy(self, request):
        """
        Obtener todas las entregas del guardia actual del día de hoy.
        
        GET /api/entregas/mis_entregas_hoy/
        """
        hoy = timezone.now().date()
        entregas = self.queryset.filter(
            guardia=request.user,
            fecha_entrega__date=hoy
        ).order_by('-fecha_entrega')
        
        serializer = self.get_serializer(entregas, many=True)
        return Response({
            'count': entregas.count(),
            'fecha': hoy,
            'entregas': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas_guardia(self, request):
        """
        Estadísticas completas del guardia actual.
        
        GET /api/entregas/estadisticas_guardia/
        
        Retorna:
        - Entregas de hoy
        - Entregas de la semana
        - Stock disponible
        - Incidencias pendientes
        - Últimas entregas
        - Última actividad
        """
        from cajas.models import Caja
        from incidencias.models import Incidencia
        
        hoy = timezone.now().date()
        inicio_semana = hoy - timedelta(days=hoy.weekday())
        
        # Entregas del guardia
        entregas_hoy = self.queryset.filter(
            guardia=request.user,
            fecha_entrega__date=hoy
        ).count()
        
        entregas_semana = self.queryset.filter(
            guardia=request.user,
            fecha_entrega__date__gte=inicio_semana
        ).count()
        
        # Última entrega
        ultima_entrega = self.queryset.filter(
            guardia=request.user
        ).order_by('-fecha_entrega').first()
        
        ultima_entrega_info = None
        if ultima_entrega:
            ultima_entrega_info = {
                'trabajador': ultima_entrega.trabajador.nombre_completo,
                'fecha': ultima_entrega.fecha_entrega,
                'hace': self._tiempo_transcurrido(ultima_entrega.fecha_entrega)
            }
        
        # Stock disponible (total)
        stock_total = Caja.objects.filter(activa=True).aggregate(
            total=models.Sum('cantidad_disponible')
        )['total'] or 0
        
        # Stock por sucursal
        stock_por_sucursal = []
        for sucursal_code, sucursal_nombre in Caja.SUCURSAL_CHOICES:
            stock = Caja.objects.filter(
                sucursal=sucursal_code,
                activa=True
            ).aggregate(total=models.Sum('cantidad_disponible'))['total'] or 0
            
            stock_por_sucursal.append({
                'sucursal': sucursal_nombre,
                'stock': stock
            })
        
        # Incidencias pendientes del guardia
        incidencias_pendientes = Incidencia.objects.filter(
            guardia=request.user,
            estado='pendiente'
        ).count()
        
        # Últimas 5 entregas
        ultimas_entregas = self.queryset.filter(
            guardia=request.user,
            fecha_entrega__date=hoy
        ).order_by('-fecha_entrega')[:5]
        
        entregas_recientes = []
        for entrega in ultimas_entregas:
            entregas_recientes.append({
                'id': entrega.id,
                'trabajador': entrega.trabajador.nombre_completo,
                'trabajador_rut': entrega.trabajador.rut,
                'caja': entrega.caja.codigo,
                'hora': entrega.fecha_entrega.strftime('%H:%M'),
                'hace': self._tiempo_transcurrido(entrega.fecha_entrega)
            })
        
        stats = {
            'entregas_hoy': entregas_hoy,
            'entregas_semana': entregas_semana,
            'stock_total': stock_total,
            'stock_por_sucursal': stock_por_sucursal,
            'incidencias_pendientes': incidencias_pendientes,
            'ultima_entrega': ultima_entrega_info,
            'entregas_recientes': entregas_recientes,
            'fecha_actual': hoy,
            'hora_actual': timezone.now().strftime('%H:%M')
        }
        
        return Response(stats)
    
    def _tiempo_transcurrido(self, fecha):
        """Calcula el tiempo transcurrido en formato legible"""
        ahora = timezone.now()
        diferencia = ahora - fecha
        
        segundos = diferencia.total_seconds()
        
        if segundos < 60:
            return "hace unos segundos"
        elif segundos < 3600:
            minutos = int(segundos / 60)
            return f"hace {minutos} min" if minutos > 1 else "hace 1 min"
        elif segundos < 86400:
            horas = int(segundos / 3600)
            return f"hace {horas}h" if horas > 1 else "hace 1h"
        else:
            dias = int(segundos / 86400)
            return f"hace {dias} días" if dias > 1 else "hace 1 día"
    
    @action(detail=False, methods=['post'])
    def validar_trabajador(self, request):
        """
        Validar trabajador por RUT o código QR.
        
        POST /api/entregas/validar_trabajador/
        Body: {
            "rut": "12345678-9"  // o "qr_code": "..."
        }
        
        Retorna:
        - Información completa del trabajador
        - Última entrega recibida
        - Validación si ya retiró caja
        """
        rut = request.data.get('rut')
        qr_code = request.data.get('qr_code')
        
        if not rut and not qr_code:
            return Response(
                {'error': 'Debe proporcionar RUT o código QR'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar trabajador
            if qr_code:
                trabajador = Trabajador.objects.get(rut=qr_code, activo=True)
            else:
                trabajador = Trabajador.objects.get(rut=rut, activo=True)
            
            # VALIDACIÓN: Verificar si ya retiró su caja
            if trabajador.estado == 'retirado':
                return Response(
                    {
                        'error': 'Este trabajador ya retiró su caja',
                        'trabajador': {
                            'nombre': trabajador.nombre_completo,
                            'rut': trabajador.rut,
                            'estado': 'retirado'
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar si tiene entregas activas
            entregas_activas = Entrega.objects.filter(
                trabajador=trabajador,
                estado__in=['entregado', 'pendiente']
            ).count()
            
            if entregas_activas > 0:
                return Response(
                    {
                        'error': 'Este trabajador ya tiene una entrega registrada',
                        'trabajador': {
                            'nombre': trabajador.nombre_completo,
                            'rut': trabajador.rut,
                            'entregas_activas': entregas_activas
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener última entrega (histórico)
            ultima_entrega = Entrega.objects.filter(
                trabajador=trabajador
            ).order_by('-fecha_entrega').first()
            
            # Serializar datos
            trabajador_data = TrabajadorSerializer(trabajador).data
            trabajador_data['ultima_entrega'] = None
            trabajador_data['puede_recibir_caja'] = True
            
            if ultima_entrega:
                trabajador_data['ultima_entrega'] = {
                    'fecha': ultima_entrega.fecha_entrega,
                    'guardia': ultima_entrega.guardia.get_full_name() if ultima_entrega.guardia else None,
                    'estado': ultima_entrega.get_estado_display()
                }
            
            return Response(trabajador_data)
            
        except Trabajador.DoesNotExist:
            return Response(
                {'error': 'Trabajador no encontrado o inactivo'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def validar_caja(self, request):
        """
        Validar caja por código o QR.
        
        POST /api/entregas/validar_caja/
        Body: {
            "codigo": "CAJA-001",  // o "qr_code": "..."
            "sucursal": "casablanca"  // opcional, para validar compatibilidad
        }
        
        Retorna:
        - Información de la caja
        - Stock disponible
        - Sucursal
        - Tipo de contrato
        """
        codigo = request.data.get('codigo')
        qr_code = request.data.get('qr_code')
        sucursal = request.data.get('sucursal')
        
        if not codigo and not qr_code:
            return Response(
                {'error': 'Debe proporcionar código o QR de la caja'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar caja (CORREGIDO: activa en lugar de activo)
            if qr_code:
                caja = Caja.objects.get(codigo=qr_code, activa=True)
            else:
                caja = Caja.objects.get(codigo=codigo, activa=True)
            
            # Validar sucursal si se proporciona
            if sucursal and caja.sucursal != sucursal:
                return Response(
                    {
                        'error': 'La caja no pertenece a la sucursal del trabajador',
                        'caja_sucursal': caja.get_sucursal_display(),
                        'trabajador_sucursal': sucursal
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar stock
            if caja.cantidad_disponible <= 0:
                return Response(
                    {
                        'error': 'No hay stock disponible de esta caja',
                        'caja': CajaSerializer(caja).data
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(CajaSerializer(caja).data)
            
        except Caja.DoesNotExist:
            return Response(
                {'error': 'Caja no encontrada o inactiva'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def crear_entrega_completa(self, request):
        """
        Flujo completo de creación de entrega.
        Acepta RUT/QR del trabajador y código/QR de la caja.
        
        POST /api/entregas/crear_entrega_completa/
        Body: {
            "trabajador_rut": "12345678-9",  // o trabajador_qr
            "caja_codigo": "CAJA-001",       // o caja_qr
            "observaciones": "..."            // opcional
        }
        """
        serializer = EntregaCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                entrega = serializer.save()
                return Response(
                    EntregaSerializer(entrega).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def validar_entrega(self, request, pk=None):
        """
        Supervisor valida una entrega.
        Solo supervisores pueden ejecutar esta acción.
        
        POST /api/entregas/{id}/validar_entrega/
        Body: {
            "comentario": "..."  // opcional
        }
        """
        # Validar que el usuario sea supervisor
        if request.user.rol != 'supervisor':
            return Response(
                {'error': 'Solo supervisores pueden validar entregas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        entrega = self.get_object()
        
        # Validar que no esté ya validada
        if entrega.validado_supervisor:
            return Response(
                {'error': 'Esta entrega ya fue validada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ValidarSupervisorSerializer(data={
            'entrega_id': entrega.id,
            'comentario': request.data.get('comentario', '')
        })
        
        if serializer.is_valid():
            entrega = serializer.save(supervisor=request.user)
            return Response(EntregaSerializer(entrega).data)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def entregas_pendientes_validacion(self, request):
        """
        Lista de entregas pendientes de validación.
        Solo para supervisores y RRHH.
        
        GET /api/entregas/entregas_pendientes_validacion/
        """
        if request.user.rol not in ['supervisor', 'rrhh']:
            return Response(
                {'error': 'No tiene permisos para ver esta información'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        entregas = self.queryset.filter(
            validado_supervisor=False,
            estado='entregado'
        ).order_by('-fecha_entrega')
        
        serializer = self.get_serializer(entregas, many=True)
        return Response({
            'count': entregas.count(),
            'entregas': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def reporte_diario(self, request):
        """
        Reporte de entregas del día.
        
        GET /api/entregas/reporte_diario/?fecha=2024-01-15
        """
        fecha_str = request.query_params.get('fecha')
        
        if fecha_str:
            try:
                fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            fecha = timezone.now().date()
        
        entregas = self.queryset.filter(fecha_entrega__date=fecha)
        
        # Estadísticas
        total = entregas.count()
        por_guardia = entregas.values(
            'guardia__username', 
            'guardia__first_name',
            'guardia__last_name'
        ).annotate(total=Count('id'))
        
        por_sucursal = entregas.values(
            'caja__sucursal'
        ).annotate(total=Count('id'))
        
        por_tipo_contrato = entregas.values(
            'caja__tipo_contrato'
        ).annotate(total=Count('id'))
        
        validadas = entregas.filter(validado_supervisor=True).count()
        pendientes = entregas.filter(validado_supervisor=False).count()
        
        return Response({
            'fecha': fecha,
            'total_entregas': total,
            'entregas_validadas': validadas,
            'entregas_pendientes': pendientes,
            'por_guardia': list(por_guardia),
            'por_sucursal': list(por_sucursal),
            'por_tipo_contrato': list(por_tipo_contrato)
        })