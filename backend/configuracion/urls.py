from django.urls import path
from .views import (
    # Sucursales
    SucursalesListView,
    CrearSucursalView,
    SucursalDetalleView,
    ActivarSucursalView,
    DesactivarSucursalView,
    # Áreas
    AreasListView,
    CrearAreaView,
    AreaDetalleView,
    ActivarAreaView,
    DesactivarAreaView,
)

urlpatterns = [
    # ==================== SUCURSALES ====================
    # Listar sucursales
    path('sucursales/', SucursalesListView.as_view(), name='sucursales-list'),
    
    # Crear sucursal
    path('sucursales/crear/', CrearSucursalView.as_view(), name='crear-sucursal'),
    
    # Detalle de sucursal
    path('sucursales/<int:pk>/', SucursalDetalleView.as_view(), name='sucursal-detalle'),
    
    # Activar sucursal
    path('sucursales/<int:pk>/activar/', ActivarSucursalView.as_view(), name='activar-sucursal'),
    
    # Desactivar sucursal
    path('sucursales/<int:pk>/desactivar/', DesactivarSucursalView.as_view(), name='desactivar-sucursal'),
    
    # ==================== ÁREAS ====================
    # Listar áreas
    path('areas/', AreasListView.as_view(), name='areas-list'),
    
    # Crear área
    path('areas/crear/', CrearAreaView.as_view(), name='crear-area'),
    
    # Detalle de área
    path('areas/<int:pk>/', AreaDetalleView.as_view(), name='area-detalle'),
    
    # Activar área
    path('areas/<int:pk>/activar/', ActivarAreaView.as_view(), name='activar-area'),
    
    # Desactivar área
    path('areas/<int:pk>/desactivar/', DesactivarAreaView.as_view(), name='desactivar-area'),
]