from django.urls import path
from .views import (
    NotificacionListView,
    NotificacionNoLeidasView,
    MarcarNotificacionLeidaView,
    MarcarTodasLeidasView
)

urlpatterns = [
    path('', NotificacionListView.as_view(), name='notificaciones-list'),
    path('no-leidas/', NotificacionNoLeidasView.as_view(), name='notificaciones-no-leidas'),
    path('<int:pk>/leer/', MarcarNotificacionLeidaView.as_view(), name='notificacion-leer'),
    path('marcar-todas-leidas/', MarcarTodasLeidasView.as_view(), name='marcar-todas-leidas'),
]