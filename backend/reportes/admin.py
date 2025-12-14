from django.contrib import admin
from .models import Reporte, EjecucionReporte

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'formato', 'activo', 'fecha_creacion']
    list_filter = ['tipo', 'formato', 'activo']
    search_fields = ['nombre', 'descripcion']

@admin.register(EjecucionReporte)
class EjecucionReporteAdmin(admin.ModelAdmin):
    list_display = ['reporte', 'estado', 'fecha_solicitud', 'fecha_fin']
    list_filter = ['estado', 'fecha_solicitud']