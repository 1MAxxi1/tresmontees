from django.contrib import admin
from .models import QRRegistro


@admin.register(QRRegistro)
class QRRegistroAdmin(admin.ModelAdmin):
    list_display = [
        'trabajador', 
        'estado', 
        'fecha_generado', 
        'fecha_enviado', 
        'enviado_email'
    ]
    list_filter = ['estado', 'enviado_email', 'fecha_generado']
    search_fields = [
        'trabajador__rut', 
        'trabajador__nombre', 
        'trabajador__apellido_paterno'
    ]
    readonly_fields = ['codigo_unico', 'hash_validacion']
    date_hierarchy = 'fecha_generado'