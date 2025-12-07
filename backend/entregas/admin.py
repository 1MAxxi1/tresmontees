from django.contrib import admin
from .models import Entrega

@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ('trabajador', 'guardia', 'fecha_entrega', 'estado')
    list_filter = ('estado', 'fecha_entrega')
    search_fields = ('trabajador__nombre', 'trabajador__apellido', 'trabajador__rut')
    ordering = ('-fecha_entrega',)

    fieldsets = (
        ('Información de Entrega', {
            'fields': ('trabajador', 'guardia', 'estado', 'codigo_qr')
        }),
        ('Detalles', {
            'fields': ('observaciones',)
        }),
    )