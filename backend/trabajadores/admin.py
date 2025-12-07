from django.contrib import admin
from .models import Trabajador


@admin.register(Trabajador)
class TrabajadorAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para Trabajadores
    """
    
    list_display = [
        'rut',
        'nombre_completo',
        'cargo',
        'sede',
        'tipo_contrato_display',
        'estado_display',
        'activo',
    ]
    
    list_filter = [
        'sede',
        'tipo_contrato',
        'estado',
        'activo',
        'fecha_creacion',
    ]
    
    search_fields = [
        'rut',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'cargo',
    ]
    
    ordering = ['apellido_paterno', 'apellido_materno', 'nombre']
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion',
    ]
    
    fieldsets = (
        ('Información Personal', {
            'fields': (
                'rut',
                'nombre',
                'apellido_paterno',
                'apellido_materno',
            )
        }),
        ('Información Laboral', {
            'fields': (
                'cargo',
                'tipo_contrato',
                'periodo',
                'sede',
            )
        }),
        ('Estado', {
            'fields': (
                'estado',
                'activo',
            )
        }),
        ('Fechas', {
            'fields': (
                'fecha_creacion',
                'fecha_actualizacion',
            ),
            'classes': ('collapse',)
        }),
    )
    
    list_per_page = 50
    
    def nombre_completo(self, obj):
        """Muestra el nombre completo del trabajador"""
        return obj.nombre_completo
    nombre_completo.short_description = 'Nombre Completo'
    
    def tipo_contrato_display(self, obj):
        """Muestra el tipo de contrato legible"""
        return obj.get_tipo_contrato_display()
    tipo_contrato_display.short_description = 'Tipo Contrato'
    
    def estado_display(self, obj):
        """Muestra el estado legible"""
        return obj.get_estado_display()
    estado_display.short_description = 'Estado'
    
    actions = ['marcar_como_retirado', 'marcar_como_pendiente', 'activar_trabajadores', 'desactivar_trabajadores']
    
    def marcar_como_retirado(self, request, queryset):
        """Marca trabajadores seleccionados como retirados"""
        updated = queryset.update(estado='retirado')
        self.message_user(request, f'{updated} trabajador(es) marcado(s) como retirado(s).')
    marcar_como_retirado.short_description = 'Marcar como retirado'
    
    def marcar_como_pendiente(self, request, queryset):
        """Marca trabajadores seleccionados como pendientes"""
        updated = queryset.update(estado='pendiente')
        self.message_user(request, f'{updated} trabajador(es) marcado(s) como pendiente(s).')
    marcar_como_pendiente.short_description = 'Marcar como pendiente'
    
    def activar_trabajadores(self, request, queryset):
        """Activa trabajadores seleccionados"""
        updated = queryset.update(activo=True)
        self.message_user(request, f'{updated} trabajador(es) activado(s).')
    activar_trabajadores.short_description = 'Activar trabajadores'
    
    def desactivar_trabajadores(self, request, queryset):
        """Desactiva trabajadores seleccionados"""
        updated = queryset.update(activo=False)
        self.message_user(request, f'{updated} trabajador(es) desactivado(s).')
    desactivar_trabajadores.short_description = 'Desactivar trabajadores'