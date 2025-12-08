from django.db import models
from trabajadores.models import Trabajador
from cajas.models import Caja
from usuarios.models import Usuario
from django.core.exceptions import ValidationError
from django.utils import timezone

class Entrega(models.Model):
    """
    Modelo mejorado para registrar entregas de cajas a trabajadores.
    Incluye validaciones de compatibilidad y control de inventario.
    """
    
    ESTADO_CHOICES = [
        ('entregado', 'Entregado'),
        ('no_entregado', 'No Entregado'),
        ('pendiente', 'Pendiente'),
    ]
    
    # Relaciones principales
    trabajador = models.ForeignKey(
        Trabajador, 
        on_delete=models.CASCADE, 
        verbose_name='Trabajador',
        help_text='Trabajador que recibe la caja'
    )
    caja = models.ForeignKey(
        Caja,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Caja Entregada',
        help_text='Caja específica que se entrega'
    )
    guardia = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name='Guardia', 
        limit_choices_to={'rol': 'guardia'},
        help_text='Guardia que realiza la entrega'
    )
    
    # Información de la entrega
    fecha_entrega = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de Entrega'
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='entregado', 
        verbose_name='Estado'
    )
    observaciones = models.TextField(
        blank=True, 
        verbose_name='Observaciones'
    )
    
    # Códigos QR escaneados
    codigo_qr_trabajador = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name='Código QR Trabajador'
    )
    codigo_qr_caja = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name='Código QR Caja'
    )
    
    # Campos de validación y auditoría
    validado_supervisor = models.BooleanField(
        default=False,
        verbose_name='Validado por Supervisor'
    )
    supervisor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entregas_validadas',
        verbose_name='Supervisor',
        limit_choices_to={'rol': 'supervisor'}
    )
    fecha_validacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Validación'
    )
    
    class Meta:
        verbose_name = 'Entrega'
        verbose_name_plural = 'Entregas'
        ordering = ['-fecha_entrega']
        indexes = [
            models.Index(fields=['-fecha_entrega']),
            models.Index(fields=['trabajador', '-fecha_entrega']),
            models.Index(fields=['guardia', '-fecha_entrega']),
            models.Index(fields=['estado']),
        ]
    
    def clean(self):
        """
        Validaciones personalizadas para asegurar compatibilidad
        entre trabajador y caja.
        """
        if self.trabajador and self.caja:
            # Obtener sede/sucursal del trabajador (compatible con ambos nombres de campo)
            trabajador_sede = getattr(self.trabajador, 'sede', None) or getattr(self.trabajador, 'sucursal', None)
            caja_sucursal = self.caja.sucursal
            
            # Validar sucursal/sede
            if trabajador_sede and caja_sucursal and trabajador_sede != caja_sucursal:
                raise ValidationError({
                    'caja': f'La caja es de {self.caja.get_sucursal_display()}, '
                           f'pero el trabajador es de otra ubicación'
                })
            
            # Validar tipo de contrato
            tipo_trabajador = self.trabajador.tipo_contrato
            tipo_caja = self.caja.tipo_contrato
            
            # Validar compatibilidad de tipos (corregido: plazo_fijo)
            if tipo_trabajador == 'plazo_fijo' and tipo_caja != 'plazo_fijo':
                raise ValidationError({
                    'caja': 'El trabajador tiene contrato a plazo fijo pero la caja es para contratos indefinidos'
                })
            elif tipo_trabajador == 'indefinido' and tipo_caja != 'indefinido':
                raise ValidationError({
                    'caja': 'El trabajador tiene contrato indefinido pero la caja es para contratos a plazo fijo'
                })
            
            # Validar stock disponible
            if self.caja.cantidad_disponible <= 0:
                raise ValidationError({
                    'caja': f'No hay stock disponible de esta caja'
                })
            
            # Validar que la caja esté activa
            if not self.caja.activa:
                raise ValidationError({
                    'caja': 'Esta caja está inactiva y no se puede entregar'
                })
    
    def save(self, *args, **kwargs):
        """
        Sobrescribir save para ejecutar validaciones
        antes de guardar.
        """
        self.full_clean()
        super().save(*args, **kwargs)
    
    def validar(self, supervisor):
        """
        Método para que un supervisor valide la entrega.
        """
        self.validado_supervisor = True
        self.supervisor = supervisor
        self.fecha_validacion = timezone.now()
        self.save(update_fields=['validado_supervisor', 'supervisor', 'fecha_validacion'])
    
    def __str__(self):
        # Obtener nombre completo del trabajador de forma compatible
        trabajador_nombre = getattr(self.trabajador, 'nombre_completo', None)
        if trabajador_nombre:
            nombre = trabajador_nombre
        else:
            nombre = f"{self.trabajador.nombre} {getattr(self.trabajador, 'apellido_paterno', '')}"
        
        return f"Entrega a {nombre} - {self.fecha_entrega.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def tiempo_transcurrido(self):
        """Calcula el tiempo desde la entrega"""
        from django.utils.timesince import timesince
        return timesince(self.fecha_entrega)