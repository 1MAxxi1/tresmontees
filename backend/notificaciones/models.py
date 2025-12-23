from django.db import models
from usuarios.models import Usuario


class Notificacion(models.Model):
    """
    Sistema de notificaciones para RRHH
    """
    
    TIPO_CHOICES = [
        ('resumen_entregas', 'Resumen de Entregas'),
        ('incidencia_nueva', 'Incidencia Nueva'),
        ('stock_bajo', 'Stock Bajo'),
        ('campana_vence', 'Campaña Próxima a Vencer'),
        ('trabajador_nuevo', 'Trabajador Nuevo'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]
    
    # Información básica
    tipo = models.CharField(
        max_length=30,
        choices=TIPO_CHOICES,
        verbose_name='Tipo de Notificación'
    )
    titulo = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    mensaje = models.TextField(
        verbose_name='Mensaje'
    )
    prioridad = models.CharField(
        max_length=10,
        choices=PRIORIDAD_CHOICES,
        default='media',
        verbose_name='Prioridad'
    )
    
    # Datos adicionales (JSON para flexibilidad)
    datos_extra = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Datos Adicionales',
        help_text='Información adicional en formato JSON'
    )
    
    # Estado
    leida = models.BooleanField(
        default=False,
        verbose_name='Leída'
    )
    
    # Referencias opcionales
    usuario_destinatario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notificaciones_recibidas',
        verbose_name='Destinatario',
        help_text='Si es None, es para todos los RRHH'
    )
    
    # Auditoría
    creado_en = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    leida_en = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Lectura'
    )
    
    class Meta:
        db_table = 'notificaciones'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-creado_en']
        indexes = [
            models.Index(fields=['-creado_en']),
            models.Index(fields=['tipo', '-creado_en']),
            models.Index(fields=['leida', '-creado_en']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.titulo}"
    
    def marcar_como_leida(self):
        """Marca la notificación como leída"""
        from django.utils import timezone
        if not self.leida:
            self.leida = True
            self.leida_en = timezone.now()
            self.save()
    
    @property
    def icono(self):
        """Retorna el icono según el tipo"""
        iconos = {
            'resumen_entregas': '📦',
            'incidencia_nueva': '⚠️',
            'stock_bajo': '🔴',
            'campana_vence': '⏰',
            'trabajador_nuevo': '👤',
        }
        return iconos.get(self.tipo, '🔔')
    
    @property
    def color(self):
        """Retorna el color según la prioridad"""
        colores = {
            'baja': '#2196f3',    # Azul
            'media': '#ff9800',   # Naranja
            'alta': '#f44336',    # Rojo
        }
        return colores.get(self.prioridad, '#2196f3')
    
    @classmethod
    def crear_resumen_entregas(cls, fecha, total_entregas, sucursales_detalle):
        """
        Crea una notificación de resumen diario de entregas
        
        Args:
            fecha: Fecha del resumen
            total_entregas: Total de entregas del día
            sucursales_detalle: Dict con detalles por sucursal
        """
        return cls.objects.create(
            tipo='resumen_entregas',
            titulo=f'Resumen de Entregas - {fecha.strftime("%d/%m/%Y")}',
            mensaje=f'Se realizaron {total_entregas} entregas hoy',
            prioridad='baja',
            datos_extra={
                'fecha': fecha.isoformat(),
                'total': total_entregas,
                'sucursales': sucursales_detalle
            }
        )
    
    @classmethod
    def crear_incidencia_nueva(cls, incidencia):
        """Crea una notificación para incidencia nueva"""
        return cls.objects.create(
            tipo='incidencia_nueva',
            titulo='Nueva Incidencia Reportada',
            mensaje=f'{incidencia.trabajador.nombre_completo} reportó: {incidencia.tipo_nombre}',
            prioridad='media',
            datos_extra={
                'incidencia_id': incidencia.id,
                'trabajador': incidencia.trabajador.nombre_completo,
                'tipo': incidencia.tipo_nombre,
            }
        )
    
    @classmethod
    def crear_stock_bajo(cls, sucursal, tipo_contrato, cantidad):
        """Crea una notificación de stock bajo"""
        prioridad = 'alta' if cantidad <= 5 else 'media'
        
        return cls.objects.create(
            tipo='stock_bajo',
            titulo=f'⚠️ Stock Bajo - {sucursal}',
            mensaje=f'Solo quedan {cantidad} cajas tipo {tipo_contrato}',
            prioridad=prioridad,
            datos_extra={
                'sucursal': sucursal,
                'tipo_contrato': tipo_contrato,
                'cantidad': cantidad
            }
        )
    
    @classmethod
    def crear_campana_vence(cls, campana, dias_restantes):
        """Crea una notificación de campaña próxima a vencer"""
        prioridad = 'alta' if dias_restantes <= 3 else 'media'
        
        return cls.objects.create(
            tipo='campana_vence',
            titulo=f'⏰ Campaña Próxima a Finalizar',
            mensaje=f'"{campana.nombre}" finaliza en {dias_restantes} días',
            prioridad=prioridad,
            datos_extra={
                'campana_id': campana.id,
                'campana_nombre': campana.nombre,
                'dias_restantes': dias_restantes,
                'fecha_fin': campana.fecha_fin.isoformat()
            }
        )
    
    @classmethod
    def crear_trabajador_nuevo(cls, trabajador):
        """Crea una notificación de trabajador nuevo"""
        return cls.objects.create(
            tipo='trabajador_nuevo',
            titulo='👤 Nuevo Trabajador Registrado',
            mensaje=f'{trabajador.nombre_completo} necesita asignación de área',
            prioridad='media',
            datos_extra={
                'trabajador_id': trabajador.id,
                'trabajador_nombre': trabajador.nombre_completo,
                'rut': trabajador.rut,
                'sede': trabajador.sede
            }
        )