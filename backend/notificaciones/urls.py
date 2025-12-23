from django.urls import path
from .views import (
    NotificacionesListView,
    MarcarComoLeidaView,
    MarcarTodasLeidasView,
    EliminarNotificacionView,
    EstadisticasNotificacionesView,
    LimpiarNotificacionesAntiguasView,
)

urlpatterns = [
    # Listar notificaciones
    path('notificaciones/', NotificacionesListView.as_view(), name='notificaciones-list'),
    
    # Estadísticas
    path('notificaciones/estadisticas/', EstadisticasNotificacionesView.as_view(), name='notificaciones-estadisticas'),
    
    # Marcar como leída
    path('notificaciones/<int:pk>/marcar-leida/', MarcarComoLeidaView.as_view(), name='marcar-leida'),
    
    # Marcar todas como leídas
    path('notificaciones/marcar-todas-leidas/', MarcarTodasLeidasView.as_view(), name='marcar-todas-leidas'),
    
    # Eliminar notificación
    path('notificaciones/<int:pk>/eliminar/', EliminarNotificacionView.as_view(), name='eliminar-notificacion'),
    
    # Limpiar antiguas
    path('notificaciones/limpiar-antiguas/', LimpiarNotificacionesAntiguasView.as_view(), name='limpiar-antiguas'),
]