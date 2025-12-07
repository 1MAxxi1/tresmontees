from django.contrib import admin
from .models import Incidencia

@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'trabajador', 'guardia', 'estado', 'fecha_reporte', 'fecha_resolucion')
    list_filter = ('tipo', 'estado', 'fecha_reporte')
    search_fields = ('trabajador__nombre', 'trabajador__apellido', 'descripcion')
    ordering = ('-fecha_reporte',)
    
    fieldsets = (
        ('Información del Reporte', {
            'fields': ('tipo', 'trabajador', 'guardia', 'descripcion')
        }),
        ('Estado y Resolución', {
            'fields': ('estado', 'supervisor', 'fecha_resolucion', 'solucion')
        }),
    )