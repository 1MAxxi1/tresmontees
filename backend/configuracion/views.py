from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Sucursal, Area
from .serializers import SucursalSerializer, AreaSerializer


# ==================== SUCURSALES ====================

class SucursalesListView(APIView):
    """Listar todas las sucursales"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Filtrar por estado si se proporciona
        activas = request.query_params.get('activas', None)
        
        if activas is not None:
            activas_bool = activas.lower() in ['true', '1', 'yes']
            sucursales = Sucursal.objects.filter(activa=activas_bool)
        else:
            sucursales = Sucursal.objects.all()
        
        serializer = SucursalSerializer(sucursales, many=True)
        return Response(serializer.data)


class CrearSucursalView(APIView):
    """Crear una nueva sucursal"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SucursalSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Guardar con el usuario que la creó
        serializer.save(creado_por=request.user)
        
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class SucursalDetalleView(APIView):
    """Ver, actualizar o eliminar una sucursal"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        sucursal = get_object_or_404(Sucursal, pk=pk)
        serializer = SucursalSerializer(sucursal)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        sucursal = get_object_or_404(Sucursal, pk=pk)
        serializer = SucursalSerializer(
            sucursal,
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
        sucursal = get_object_or_404(Sucursal, pk=pk)
        
        # Verificar si puede eliminarse
        puede, mensaje = sucursal.puede_desactivarse
        if not puede:
            return Response(
                {'error': f'No se puede eliminar: {mensaje}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sucursal.delete()
        return Response(
            {'message': 'Sucursal eliminada correctamente'},
            status=status.HTTP_200_OK
        )


class ActivarSucursalView(APIView):
    """Activar una sucursal desactivada"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        sucursal = get_object_or_404(Sucursal, pk=pk)
        sucursal.activa = True
        sucursal.save()
        
        serializer = SucursalSerializer(sucursal)
        return Response({
            'message': 'Sucursal activada correctamente',
            'sucursal': serializer.data
        })


class DesactivarSucursalView(APIView):
    """Desactivar una sucursal"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        sucursal = get_object_or_404(Sucursal, pk=pk)
        
        # Verificar si puede desactivarse
        puede, mensaje = sucursal.puede_desactivarse
        if not puede:
            return Response(
                {'error': mensaje},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sucursal.activa = False
        sucursal.save()
        
        serializer = SucursalSerializer(sucursal)
        return Response({
            'message': 'Sucursal desactivada correctamente',
            'sucursal': serializer.data
        })


# ==================== ÁREAS ====================

class AreasListView(APIView):
    """Listar todas las áreas"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Filtrar por estado si se proporciona
        activas = request.query_params.get('activas', None)
        
        if activas is not None:
            activas_bool = activas.lower() in ['true', '1', 'yes']
            areas = Area.objects.filter(activa=activas_bool)
        else:
            areas = Area.objects.all()
        
        serializer = AreaSerializer(areas, many=True)
        return Response(serializer.data)


class CrearAreaView(APIView):
    """Crear una nueva área"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AreaSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Guardar con el usuario que la creó
        serializer.save(creado_por=request.user)
        
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class AreaDetalleView(APIView):
    """Ver, actualizar o eliminar un área"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        area = get_object_or_404(Area, pk=pk)
        serializer = AreaSerializer(area)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        area = get_object_or_404(Area, pk=pk)
        serializer = AreaSerializer(
            area,
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
        area = get_object_or_404(Area, pk=pk)
        
        # Verificar si puede eliminarse
        puede, mensaje = area.puede_desactivarse
        if not puede:
            return Response(
                {'error': f'No se puede eliminar: {mensaje}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        area.delete()
        return Response(
            {'message': 'Área eliminada correctamente'},
            status=status.HTTP_200_OK
        )


class ActivarAreaView(APIView):
    """Activar un área desactivada"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        area = get_object_or_404(Area, pk=pk)
        area.activa = True
        area.save()
        
        serializer = AreaSerializer(area)
        return Response({
            'message': 'Área activada correctamente',
            'area': serializer.data
        })


class DesactivarAreaView(APIView):
    """Desactivar un área"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        area = get_object_or_404(Area, pk=pk)
        
        # Verificar si puede desactivarse
        puede, mensaje = area.puede_desactivarse
        if not puede:
            return Response(
                {'error': mensaje},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        area.activa = False
        area.save()
        
        serializer = AreaSerializer(area)
        return Response({
            'message': 'Área desactivada correctamente',
            'area': serializer.data
        })