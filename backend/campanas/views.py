from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date

from .models import CampanaEntrega
from .serializers import CampanaEntregaSerializer, CrearCampanaSerializer
from trabajadores.models import Trabajador
from cajas.models import Caja


class CampanasListView(APIView):
    """Listar todas las campañas de entrega"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        campanas = CampanaEntrega.objects.all()
        
        # Filtrar por estado si se proporciona
        estado = request.query_params.get('estado', None)
        if estado == 'activas':
            campanas = campanas.filter(activa=True)
        elif estado == 'inactivas':
            campanas = campanas.filter(activa=False)
        elif estado == 'vigentes':
            hoy = date.today()
            campanas = campanas.filter(
                activa=True,
                fecha_inicio__lte=hoy,
                fecha_fin__gte=hoy
            )
        
        serializer = CampanaEntregaSerializer(campanas, many=True)
        return Response(serializer.data)


class CrearCampanaView(APIView):
    """Crear una nueva campaña de entrega"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CrearCampanaSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear la campaña
        campana = CampanaEntrega.objects.create(
            nombre=serializer.validated_data['nombre'],
            descripcion=serializer.validated_data.get('descripcion', ''),
            sucursal=serializer.validated_data['sucursal'],
            tipo_entrega=serializer.validated_data['tipo_entrega'],
            areas_seleccionadas=serializer.validated_data['areas_seleccionadas'],
            tipo_contrato=serializer.validated_data['tipo_contrato'],
            fecha_inicio=serializer.validated_data['fecha_inicio'],
            fecha_fin=serializer.validated_data['fecha_fin'],
            creado_por=request.user,
            activa=True
        )
        
        response_serializer = CampanaEntregaSerializer(campana)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class CampanaDetalleView(APIView):
    """Ver, actualizar o eliminar una campaña específica"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        campana = get_object_or_404(CampanaEntrega, pk=pk)
        serializer = CampanaEntregaSerializer(campana)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        campana = get_object_or_404(CampanaEntrega, pk=pk)
        serializer = CampanaEntregaSerializer(
            campana,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        return Response(serializer.data)
    
    def delete(self, request, pk):
        campana = get_object_or_404(CampanaEntrega, pk=pk)
        campana.delete()
        return Response(
            {'message': 'Campaña eliminada correctamente'},
            status=status.HTTP_200_OK
        )


class FinalizarCampanaView(APIView):
    """Finalizar/desactivar una campaña"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        campana = get_object_or_404(CampanaEntrega, pk=pk)
        campana.activa = False
        campana.save()
        
        serializer = CampanaEntregaSerializer(campana)
        return Response({
            'message': 'Campaña finalizada correctamente',
            'campana': serializer.data
        })


class ReactivarCampanaView(APIView):
    """Reactivar una campaña"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        campana = get_object_or_404(CampanaEntrega, pk=pk)
        campana.activa = True
        campana.save()
        
        serializer = CampanaEntregaSerializer(campana)
        return Response({
            'message': 'Campaña reactivada correctamente',
            'campana': serializer.data
        })


class ValidarTrabajadorCampanaView(APIView):
    """Validar si un trabajador puede retirar en alguna campaña activa"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        rut = request.data.get('rut')
        
        if not rut:
            return Response(
                {'error': 'El RUT es obligatorio'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            trabajador = Trabajador.objects.get(rut=rut)
        except Trabajador.DoesNotExist:
            return Response(
                {'error': 'Trabajador no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Buscar campañas vigentes para este trabajador
        hoy = date.today()
        
        # Mapear sede del trabajador a sucursal de campaña
        SEDE_TO_SUCURSAL = {
            'Casablanca': 'casablanca',
            'Valparaíso – Planta BIF': 'valparaiso_bif',
            'Valparaíso – Planta BIC': 'valparaiso_bic',
        }
        
        sucursal_campana = SEDE_TO_SUCURSAL.get(trabajador.sede)
        
        if not sucursal_campana:
            return Response({
                'puede_retirar': False,
                'mensaje': 'No se encontró una sucursal correspondiente',
                'trabajador': {
                    'rut': trabajador.rut,
                    'nombre': trabajador.nombre_completo,
                    'sede': trabajador.sede,
                    'area': trabajador.get_area_display(),
                    'tipo_contrato': trabajador.get_tipo_contrato_display(),
                }
            })
        
        campanas_vigentes = CampanaEntrega.objects.filter(
            activa=True,
            fecha_inicio__lte=hoy,
            fecha_fin__gte=hoy,
            sucursal=sucursal_campana,
            tipo_contrato__contains=[trabajador.tipo_contrato]  # Buscar en la lista
        )
        
        # Verificar si alguna campaña le aplica
        campana_aplicable = None
        for campana in campanas_vigentes:
            puede, mensaje = campana.trabajador_puede_retirar(trabajador)
            if puede:
                campana_aplicable = campana
                break
        
        if campana_aplicable:
            # Verificar si hay cajas disponibles
            cajas_disponibles = Caja.objects.filter(
                sucursal=sucursal_campana,
                tipo_contrato=trabajador.tipo_contrato,
                activa=True,
                cantidad_disponible__gt=0
            )
            
            if not cajas_disponibles.exists():
                return Response({
                    'puede_retirar': False,
                    'mensaje': 'No hay cajas disponibles en este momento',
                    'campana': CampanaEntregaSerializer(campana_aplicable).data,
                    'trabajador': {
                        'rut': trabajador.rut,
                        'nombre': trabajador.nombre_completo,
                        'sede': trabajador.sede,
                        'area': trabajador.get_area_display(),
                        'tipo_contrato': trabajador.get_tipo_contrato_display(),
                    }
                })
            
            return Response({
                'puede_retirar': True,
                'mensaje': 'El trabajador puede retirar su caja',
                'campana': CampanaEntregaSerializer(campana_aplicable).data,
                'trabajador': {
                    'rut': trabajador.rut,
                    'nombre': trabajador.nombre_completo,
                    'sede': trabajador.sede,
                    'area': trabajador.get_area_display(),
                    'tipo_contrato': trabajador.get_tipo_contrato_display(),
                },
                'cajas_disponibles': cajas_disponibles.count()
            })
        else:
            return Response({
                'puede_retirar': False,
                'mensaje': 'No hay campañas activas para este trabajador',
                'trabajador': {
                    'rut': trabajador.rut,
                    'nombre': trabajador.nombre_completo,
                    'sede': trabajador.sede,
                    'area': trabajador.get_area_display(),
                    'tipo_contrato': trabajador.get_tipo_contrato_display(),
                }
            })


class EstadisticasCampanaView(APIView):
    """Obtener estadísticas de una campaña específica"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        campana = get_object_or_404(CampanaEntrega, pk=pk)
        
        trabajadores_elegibles = campana.contar_trabajadores_elegibles()
        entregas_realizadas = campana.contar_entregas_realizadas()
        
        porcentaje = 0
        if trabajadores_elegibles > 0:
            porcentaje = round((entregas_realizadas / trabajadores_elegibles) * 100, 2)
        
        return Response({
            'campana': CampanaEntregaSerializer(campana).data,
            'trabajadores_elegibles': trabajadores_elegibles,
            'entregas_realizadas': entregas_realizadas,
            'entregas_pendientes': trabajadores_elegibles - entregas_realizadas,
            'porcentaje_completado': porcentaje
        })