from django.urls import path
from .views import (
    CampanasListView,
    CrearCampanaView,
    CampanaDetalleView,
    FinalizarCampanaView,
    ReactivarCampanaView,
    ValidarTrabajadorCampanaView,
    EstadisticasCampanaView,
)

urlpatterns = [
    # Listar campañas
    path('campanas/', CampanasListView.as_view(), name='campanas-list'),
    
    # Crear campaña
    path('campanas/crear/', CrearCampanaView.as_view(), name='crear-campana'),
    
    # Detalle de campaña
    path('campanas/<int:pk>/', CampanaDetalleView.as_view(), name='campana-detalle'),
    
    # Finalizar campaña
    path('campanas/<int:pk>/finalizar/', FinalizarCampanaView.as_view(), name='finalizar-campana'),
    
    # Reactivar campaña
    path('campanas/<int:pk>/reactivar/', ReactivarCampanaView.as_view(), name='reactivar-campana'),
    
    # Estadísticas de campaña
    path('campanas/<int:pk>/estadisticas/', EstadisticasCampanaView.as_view(), name='estadisticas-campana'),
    
    # Validar trabajador
    path('validar-trabajador/', ValidarTrabajadorCampanaView.as_view(), name='validar-trabajador-campana'),
]