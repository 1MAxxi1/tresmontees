from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('usuarios.urls')),
    path('api/trabajadores/', include('trabajadores.urls')),
    path('api/cajas/', include('cajas.urls')),
    path('api/entregas/', include('entregas.urls')),
    path('api/incidencias/', include('incidencias.urls')),
    path('api/reportes/', include('reportes.urls')),          
    path('api/notificaciones/', include('notificaciones.urls')),
    path('api/qr/', include('qr_system.urls')),
    path('api/supervisor/', include('supervisor.urls')),
    path('api/', include('campanas.urls')),
    path('api/', include('configuracion.urls')),
    path('api/', include('notificaciones.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)