from django.urls import path
from .views import (
    QRListView,
    GenerarQRView,
    DescargarQRView,
    EnviarQREmailView,
    GenerarQRMasivoView,
    EnviarQRMasivoView,
)

urlpatterns = [
    path('', QRListView.as_view(), name='qr-list'),
    
    # Operaciones individuales
    path('generar/<int:trabajador_id>/', GenerarQRView.as_view(), name='qr-generar'),
    path('descargar/<int:trabajador_id>/', DescargarQRView.as_view(), name='qr-descargar'),
    path('enviar-email/<int:trabajador_id>/', EnviarQREmailView.as_view(), name='qr-enviar-email'),
    
    # Operaciones masivas
    path('generar-masivo/', GenerarQRMasivoView.as_view(), name='qr-generar-masivo'),
    path('enviar-masivo/', EnviarQRMasivoView.as_view(), name='qr-enviar-masivo'),
]