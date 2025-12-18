from django.urls import path
from .views import (
    SupervisorInfoView,
    SupervisorEstadisticasView,
    IncidenciasListView,
    ActualizarIncidenciaView,
    ReabrirIncidenciaView,
    IncidenciaDetalleView,
)

urlpatterns = [
    # Información del supervisor
    path('info/', SupervisorInfoView.as_view(), name='supervisor-info'),
    
    # Estadísticas
    path('estadisticas/', SupervisorEstadisticasView.as_view(), name='supervisor-estadisticas'),
    
    # Incidencias
    path('incidencias/', IncidenciasListView.as_view(), name='supervisor-incidencias-list'),
    path('incidencias/<int:pk>/', IncidenciaDetalleView.as_view(), name='supervisor-incidencia-detalle'),
    path('incidencias/<int:pk>/actualizar/', ActualizarIncidenciaView.as_view(), name='supervisor-incidencia-actualizar'),
    path('incidencias/<int:pk>/reabrir/', ReabrirIncidenciaView.as_view(), name='supervisor-incidencia-reabrir'),
]