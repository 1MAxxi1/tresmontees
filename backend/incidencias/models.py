from django.db import models
from trabajadores.models import Trabajador
from usuarios.models import Usuario
from entregas.models import Entrega
from django.utils import timezone

class Incidencia(models.Model):
    """
    Modelo mejorado para registro de incidencias.
    Permite al guardia reportar problemas y al supervisor resolverlos.
    """
    
    TIPO_CHOICES = [
        ('qr_no_funciona', 'QR no funciona'),
        ('trabajador_no_registrado', 'Trabajador no registrado'),
        ('caja_danada', 'Caja dañada'),
        ('stock_insuficiente', 'Stock insuficiente'),
        ('trabajador_sin_beneficio', 'Trabajador sin derecho a beneficio'),
        ('incompatibilidad_contrato', 'Incompatibilidad de contrato'),
        ('sistema_caido', 'Sistema caído'),
        ('otro', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('resuelto', 'Resuelto'),
        ('rechazado', 'Rechazado'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]
    
    # Relaciones
    trabajador = models.ForeignKey(
        Trabajador, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name='Trabajador',
        help_text='Trabajador relacionado con la incidencia'
    )
    guardia = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='incidencias_reportadas', 
        verbose_name='Guardia que reporta', 
        limit_choices_to={'rol': 'guardia'}
    )
    supervisor = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='incidencias_resueltas', 
        verbose_name='Supervisor que resuelve', 
        limit_choices_to={'rol': 'supervisor'}
    )
    entrega_relacionada = models.ForeignKey(
        Entrega,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Entrega Relacionada',
        help_text='Entrega asociada a esta incidencia'
    )
    
    # Información de la incidencia
    tipo = models.CharField(
        max_length=30, 
        choices=TIPO_CHOICES, 
        verbose_name='Tipo de Incidencia'
    )
    descripcion = models.TextField(
        verbose_name='Descripción',
        help_text='Descripción detallada del problema'
    )
    prioridad = models.CharField(
        max_length=10,
        choices=PRIORIDAD_CHOICES,
        default='media',
        verbose_name='Prioridad'
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='pendiente', 
        verbose_name='Estado'
    )
    
    # Fechas
    fecha_reporte = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de Reporte'
    )
    fecha_resolucion = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='Fecha de Resolución'
    )
    
    # Solución
    solucion = models.TextField(
        blank=True, 
        verbose_name='Solución',
        help_text='Descripción de cómo se resolvió la incidencia'
    )
    
    # Campos adicionales
    rut_trabajador_manual = models.CharField(
        max_length=12,
        blank=True,
        verbose_name='RUT ingresado manualmente',
        help_text='RUT del trabajador si no se pudo escanear QR'
    )
    imagen_evidencia = models.ImageField(
        upload_to='incidencias/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Imagen de Evidencia',
        help_text='Foto del problema (opcional)'
    )
    
    # Metadata
    notificado = models.BooleanField(
        default=False,
        verbose_name='Notificado a Supervisor',
        help_text='Si se notificó al supervisor'
    )
    
    class Meta:
        verbose_name = 'Incidencia'
        verbose_name_plural = 'Incidencias'
        ordering = ['-fecha_reporte']
        indexes = [
            models.Index(fields=['-fecha_reporte']),
            models.Index(fields=['estado', '-fecha_reporte']),
            models.Index(fields=['prioridad', 'estado']),
            models.Index(fields=['guardia', '-fecha_reporte']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.estado} - {self.fecha_reporte.strftime('%d/%m/%Y')}"
    
    def save(self, *args, **kwargs):
        """
        Sobrescribir save para:
        - Asignar prioridad automática si no se especificó
        - Actualizar fecha de resolución cuando se resuelve
        """
        # Asignar prioridad automática
        if not self.pk and not self.prioridad:
            self.asignar_prioridad_automatica()
        
        # Actualizar fecha de resolución
        if self.estado == 'resuelto' and not self.fecha_resolucion:
            self.fecha_resolucion = timezone.now()
        
        super().save(*args, **kwargs)
    
    def asignar_prioridad_automatica(self):
        """
        Asignar prioridad según tipo de incidencia.
        
        - Crítica: stock_insuficiente, sistema_caido
        - Alta: trabajador_sin_beneficio, caja_danada
        - Media: resto
        """
        prioridades_criticas = ['stock_insuficiente', 'sistema_caido']
        prioridades_altas = ['trabajador_sin_beneficio', 'caja_danada', 'incompatibilidad_contrato']
        
        if self.tipo in prioridades_criticas:
            self.prioridad = 'critica'
        elif self.tipo in prioridades_altas:
            self.prioridad = 'alta'
        else:
            self.prioridad = 'media'
    
    def resolver(self, supervisor, solucion):
        """
        Método para que un supervisor resuelva la incidencia.
        
        Args:
            supervisor: Usuario con rol supervisor
            solucion: Texto con la solución aplicada
        """
        self.estado = 'resuelto'
        self.supervisor = supervisor
        self.solucion = solucion
        self.fecha_resolucion = timezone.now()
        self.save(update_fields=['estado', 'supervisor', 'solucion', 'fecha_resolucion'])
    
    def rechazar(self, supervisor, motivo):
        """
        Método para que un supervisor rechace la incidencia.
        
        Args:
            supervisor: Usuario con rol supervisor
            motivo: Texto con el motivo del rechazo
        """
        self.estado = 'rechazado'
        self.supervisor = supervisor
        self.solucion = f"RECHAZADO: {motivo}"
        self.fecha_resolucion = timezone.now()
        self.save(update_fields=['estado', 'supervisor', 'solucion', 'fecha_resolucion'])
    
    def tomar_en_proceso(self, supervisor):
        """
        Método para que un supervisor tome la incidencia en proceso.
        
        Args:
            supervisor: Usuario con rol supervisor
        """
        self.estado = 'en_proceso'
        self.supervisor = supervisor
        self.save(update_fields=['estado', 'supervisor'])
    
    @property
    def tiempo_sin_resolver(self):
        """
        Calcula el tiempo que lleva sin resolverse.
        Útil para SLAs y reportes.
        """
        if self.estado == 'resuelto':
            if self.fecha_resolucion:
                return self.fecha_resolucion - self.fecha_reporte
            return None
        
        return timezone.now() - self.fecha_reporte
    
    @property
    def esta_vencida(self):
        """
        Determina si la incidencia está vencida según SLA.
        
        SLA por prioridad:
        - Crítica: 2 horas
        - Alta: 4 horas
        - Media: 24 horas
        - Baja: 48 horas
        """
        if self.estado in ['resuelto', 'rechazado']:
            return False
        
        tiempo = self.tiempo_sin_resolver
        
        sla = {
            'critica': timezone.timedelta(hours=2),
            'alta': timezone.timedelta(hours=4),
            'media': timezone.timedelta(hours=24),
            'baja': timezone.timedelta(hours=48),
        }
        
        return tiempo > sla.get(self.prioridad, timezone.timedelta(hours=24))
