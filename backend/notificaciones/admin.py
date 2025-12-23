from django.contrib import admin
from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'tipo',
        'titulo',
        'prioridad',
        'leida',
        'creado_en',
    ]
    list_filter = [
        'tipo',
        'leida',
        'prioridad',
        'creado_en',
    ]
    search_fields = [
        'titulo',
        'mensaje',
    ]
    readonly_fields = [
        'creado_en',
        'leida_en',
    ]
    list_per_page = 50
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('tipo', 'titulo', 'mensaje', 'prioridad')
        }),
        ('Datos Adicionales', {
            'fields': ('datos_extra',),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('leida', 'leida_en')
        }),
        ('Destinatario', {
            'fields': ('usuario_destinatario',),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('creado_en',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Las notificaciones se crean automáticamente, no manualmente
        return False