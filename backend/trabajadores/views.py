from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Trabajador
from .serializers import TrabajadorSerializer


class TrabajadorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de trabajadores con endpoints de QR
    """
    queryset = Trabajador.objects.all()
    serializer_class = TrabajadorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sede', 'tipo_contrato', 'activo']
    search_fields = ['rut', 'nombre', 'apellido_paterno', 'apellido_materno']
    ordering_fields = ['apellido_paterno', 'nombre']
    ordering = ['apellido_paterno', 'nombre']
    
    @action(detail=True, methods=['post'])
    def generar_qr(self, request, pk=None):
        """
        Genera código QR para un trabajador específico
        
        POST /api/trabajadores/{id}/generar_qr/
        """
        trabajador = self.get_object()
        
        try:
            # Marcar como QR generado
            trabajador.generar_qr()
            
            return Response({
                'message': f'QR generado correctamente para {trabajador.nombre_completo}',
                'trabajador': TrabajadorSerializer(trabajador).data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error al generar QR: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def generar_qr_masivo(self, request):
        print("=" * 50)  # ✅ AGREGAR ESTA LÍNEA
        print("ENDPOINT LLAMADO: generar_qr_masivo")  # ✅ AGREGAR ESTA LÍNEA
        print("=" * 50)  # ✅ AGREGAR ESTA LÍNEA
        """
        Genera códigos QR para todos los trabajadores activos sin QR
        
        POST /api/trabajadores/generar_qr_masivo/
        """
        try:
            # Obtener trabajadores activos sin QR generado
            trabajadores = Trabajador.objects.filter(
                activo=True,
                qr_generado=False
            )
            
            total = trabajadores.count()
            print(f"Total encontrados: {total}")
            
            if total == 0:
                return Response({
                    'message': 'No hay trabajadores pendientes de generar QR',
                    'generados': 0,
                    'errores': 0
                })
            
            # Generar QR para cada trabajador
            generados = 0
            errores = []
            
            for trabajador in trabajadores:
                try:
                    # CRÍTICO: Llamar al método del modelo
                    trabajador.generar_qr()
                    generados += 1
                except Exception as e:
                    errores.append(f"{trabajador.rut}: {str(e)}")
                    print(f"Error generando QR para {trabajador.rut}: {e}")
            
            return Response({
                'message': f'QR generados correctamente',
                'generados': generados,
                'errores': len(errores),
                'total': total
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error al generar QRs masivos: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def enviar_qr_masivo(self, request):
        """
        Envía códigos QR por email a todos los trabajadores
        
        POST /api/trabajadores/enviar_qr_masivo/
        """
        try:
            # Obtener trabajadores activos con QR generado y email
            trabajadores = Trabajador.objects.filter(
                activo=True,
                qr_generado=True,
                email__isnull=False
            ).exclude(email='')
            
            total = trabajadores.count()
            
            if total == 0:
                return Response({
                    'message': 'No hay trabajadores con email y QR generado',
                    'total': 0
                })
            
            # TODO: Implementar envío de emails real
            enviados = total  # Simulado por ahora
            
            return Response({
                'message': f'QRs enviados correctamente: {enviados} de {total}',
                'total': total,
                'enviados': enviados,
                'fallidos': total - enviados
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error al enviar QRs masivos: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Obtiene estadísticas generales de trabajadores
        
        GET /api/trabajadores/estadisticas/
        """
        total = Trabajador.objects.count()
        activos = Trabajador.objects.filter(activo=True).count()
        inactivos = Trabajador.objects.filter(activo=False).count()
        
        # Por tipo de contrato
        indefinidos = Trabajador.objects.filter(tipo_contrato='indefinido').count()
        plazo_fijo = Trabajador.objects.filter(tipo_contrato='plazo_fijo').count()
        
        # Por estado de retiro
        pendientes = Trabajador.objects.filter(estado='pendiente').count()
        retirados = Trabajador.objects.filter(estado='retirado').count()
        
        # QR generados
        qr_generados = Trabajador.objects.filter(qr_generado=True).count()
        qr_pendientes = Trabajador.objects.filter(qr_generado=False).count()
        
        return Response({
            'total': total,
            'activos': activos,
            'inactivos': inactivos,
            'por_contrato': {
                'indefinidos': indefinidos,
                'plazo_fijo': plazo_fijo
            },
            'por_estado': {
                'pendientes': pendientes,
                'retirados': retirados
            },
            'qr': {
                'generados': qr_generados,
                'pendientes': qr_pendientes,
                'porcentaje': round((qr_generados / total * 100) if total > 0 else 0, 2)
            }
        })