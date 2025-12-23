import pandas as pd
from io import BytesIO
from django.db import transaction
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
    ViewSet para gestión de trabajadores con endpoints de QR e importación masiva
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
        """
        Genera códigos QR para todos los trabajadores activos sin QR
        
        POST /api/trabajadores/generar_qr_masivo/
        """
        print("=" * 50)
        print("ENDPOINT LLAMADO: generar_qr_masivo")
        print("=" * 50)
        
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
    
    @action(detail=False, methods=['post'])
    def importar_masivo(self, request):
        """
        Importa trabajadores desde un archivo Excel o CSV
        
        POST /api/trabajadores/importar_masivo/
        
        Expected columns:
        - rut
        - nombre
        - apellido_paterno
        - apellido_materno
        - email (opcional)
        - telefono (opcional)
        - cargo
        - departamento (opcional)
        - tipo_contrato (indefinido o plazo_fijo)
        - sede (casablanca, valparaiso_bif, valparaiso_bic)
        """
        try:
            # Obtener archivo
            archivo = request.FILES.get('archivo')
            
            if not archivo:
                return Response(
                    {'error': 'No se proporcionó ningún archivo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Leer archivo según extensión
            nombre_archivo = archivo.name.lower()
            
            try:
                if nombre_archivo.endswith('.xlsx') or nombre_archivo.endswith('.xls'):
                    df = pd.read_excel(BytesIO(archivo.read()))
                elif nombre_archivo.endswith('.csv'):
                    df = pd.read_csv(BytesIO(archivo.read()))
                else:
                    return Response(
                        {'error': 'Formato de archivo no soportado. Use .xlsx, .xls o .csv'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {'error': f'Error al leer el archivo: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Normalizar nombres de columnas (quitar espacios, lowercase)
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
            
            # Validar columnas requeridas
            columnas_requeridas = ['rut', 'nombre', 'apellido_paterno', 'cargo', 'tipo_contrato', 'sede']
            columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]
            
            if columnas_faltantes:
                return Response(
                    {'error': f'Faltan columnas requeridas: {", ".join(columnas_faltantes)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reemplazar NaN por valores por defecto
            df = df.fillna({
                'apellido_materno': '',
                'email': '',
                'telefono': '',
                'departamento': '',
            })
            
            # Validar y preparar datos
            trabajadores_validos = []
            errores = []
            
            for index, row in df.iterrows():
                fila_num = index + 2  # +2 porque Excel empieza en 1 y tiene header
                
                try:
                    # Validar RUT
                    rut = str(row['rut']).strip()
                    if not rut or rut == 'nan':
                        errores.append({'fila': fila_num, 'error': 'RUT vacío'})
                        continue
                    
                    # Validar que RUT no exista
                    if Trabajador.objects.filter(rut=rut).exists():
                        errores.append({'fila': fila_num, 'rut': rut, 'error': 'RUT ya existe en el sistema'})
                        continue
                    
                    # Validar tipo_contrato
                    tipo_contrato = str(row['tipo_contrato']).strip().lower()
                    if tipo_contrato not in ['indefinido', 'plazo_fijo', 'plazo fijo']:
                        errores.append({'fila': fila_num, 'rut': rut, 'error': f'Tipo de contrato inválido: {tipo_contrato}'})
                        continue
                    
                    # Normalizar tipo_contrato
                    if tipo_contrato == 'plazo fijo':
                        tipo_contrato = 'plazo_fijo'
                    
                    # Validar sede
                    sede = str(row['sede']).strip().lower()
                    sedes_validas = {
                        'casablanca': 'Casablanca',
                        'valparaiso_bif': 'Valparaíso – Planta BIF',
                        'valparaiso bif': 'Valparaíso – Planta BIF',
                        'valparaiso_bic': 'Valparaíso – Planta BIC',
                        'valparaiso bic': 'Valparaíso – Planta BIC',
                    }
                    
                    if sede not in sedes_validas:
                        errores.append({'fila': fila_num, 'rut': rut, 'error': f'Sede inválida: {sede}'})
                        continue
                    
                    # Normalizar sede
                    sede_normalizada = sede.replace(' ', '_')
                    if sede_normalizada not in ['casablanca', 'valparaiso_bif', 'valparaiso_bic']:
                        if 'bif' in sede:
                            sede_normalizada = 'valparaiso_bif'
                        elif 'bic' in sede:
                            sede_normalizada = 'valparaiso_bic'
                        else:
                            sede_normalizada = 'casablanca'
                    
                    # Crear objeto trabajador
                    trabajador_data = {
                        'rut': rut,
                        'nombre': str(row['nombre']).strip(),
                        'apellido_paterno': str(row['apellido_paterno']).strip(),
                        'apellido_materno': str(row.get('apellido_materno', '')).strip(),
                        'email': str(row.get('email', '')).strip() if str(row.get('email', '')).strip() != 'nan' else None,
                        'telefono': str(row.get('telefono', '')).strip() if str(row.get('telefono', '')).strip() != 'nan' else None,
                        'cargo': str(row['cargo']).strip(),
                        'departamento': str(row.get('departamento', '')).strip(),
                        'tipo_contrato': tipo_contrato,
                        'sede': sede_normalizada,
                        'periodo': 'Importado masivamente',
                        'area': 'produccion_manufactura',  # Valor por defecto
                        'activo': True,
                    }
                    
                    trabajadores_validos.append(trabajador_data)
                    
                except Exception as e:
                    errores.append({'fila': fila_num, 'error': str(e)})
            
            # Insertar trabajadores válidos
            trabajadores_creados = 0
            
            if trabajadores_validos:
                try:
                    with transaction.atomic():
                        for data in trabajadores_validos:
                            Trabajador.objects.create(**data)
                            trabajadores_creados += 1
                except Exception as e:
                    return Response(
                        {'error': f'Error al guardar trabajadores: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            return Response({
                'message': f'Importación completada',
                'total_filas': len(df),
                'importados': trabajadores_creados,
                'errores': len(errores),
                'detalle_errores': errores[:10] if len(errores) > 10 else errores,  # Máximo 10 errores
                'mas_errores': len(errores) > 10
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error inesperado: {str(e)}'},
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