from django.db import models


class Trabajador(models.Model):
    """
    Modelo de Trabajador con información completa
    """
    
    TIPO_CONTRATO_CHOICES = [
        ('indefinido', 'Indefinido'),
        ('plazo_fijo', 'A Plazo Fijo'),
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),  # No ha retirado caja
        ('retirado', 'Retirado'),    # Ya retiró caja
    ]
    
    AREA_CHOICES = [
        ('produccion_manufactura', 'Producción y Manufactura'),
        ('logistica_distribucion', 'Logística y Distribución'),
        ('administracion', 'Administración'),
        ('rrhh', 'Recursos Humanos'),
        ('ingenieria_practicas', 'Ingeniería y Prácticas'),
    ]
    
    # Información Personal
    rut = models.CharField(
        max_length=12, 
        unique=True,
        verbose_name='RUT',
        help_text='Formato: 12345678-9'
    )
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre'
    )
    apellido_paterno = models.CharField(
        max_length=100,
        verbose_name='Apellido Paterno'
    )
    apellido_materno = models.CharField(
        max_length=100,
        verbose_name='Apellido Materno'
    )
    email = models.EmailField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Email',
        help_text='Correo electrónico del trabajador'
    )
    
    # Información Laboral
    cargo = models.CharField(
        max_length=150,
        verbose_name='Cargo',
        help_text='Ej: Operario, Supervisor, Jefe de Turno'
    )
    area = models.CharField(
        max_length=50,
        choices=AREA_CHOICES,
        verbose_name='Área/Departamento',
        help_text='Área o departamento al que pertenece',
        default='produccion_manufactura'
    )
    tipo_contrato = models.CharField(
        max_length=20,
        choices=TIPO_CONTRATO_CHOICES,
        verbose_name='Tipo de Contrato'
    )
    periodo = models.CharField(
        max_length=50,
        verbose_name='Período',
        help_text='Ej: Enero 2024 - Diciembre 2024'
    )
    sede = models.CharField(
        max_length=100,
        verbose_name='Sede',
        help_text='Ej: Casa Matriz, Sucursal Norte'
    )
    
    # Estado de Entrega
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente',
        verbose_name='Estado'
    )
    
    # ✅ NUEVOS CAMPOS: QR
    qr_generado = models.BooleanField(
        default=False,
        verbose_name='QR Generado',
        help_text='Indica si se generó el código QR para este trabajador'
    )
    qr_fecha_generacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha Generación QR',
        help_text='Fecha y hora en que se generó el QR'
    )
    qr_codigo = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Código QR',
        help_text='Ruta o identificador del archivo QR generado'
    )
    
    # Campos Administrativos
    activo = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    class Meta:
        db_table = 'trabajadores'
        verbose_name = 'Trabajador'
        verbose_name_plural = 'Trabajadores'
        ordering = ['apellido_paterno', 'apellido_materno', 'nombre']
    
    def __str__(self):
        return f"{self.rut} - {self.nombre_completo}"
    
    @property
    def nombre_completo(self):
        """Retorna el nombre completo del trabajador"""
        return f"{self.nombre} {self.apellido_paterno} {self.apellido_materno}"
    
    @property
    def apellido_completo(self):
        """Retorna ambos apellidos"""
        return f"{self.apellido_paterno} {self.apellido_materno}"
    
    def marcar_como_retirado(self):
        """Marca al trabajador como que ya retiró su caja"""
        self.estado = 'retirado'
        self.save()
    
    def marcar_como_pendiente(self):
        """Marca al trabajador como pendiente de retiro"""
        self.estado = 'pendiente'
        self.save()
    
    def generar_qr(self):
        """Marca al trabajador como que tiene QR generado"""
        from django.utils import timezone
        self.qr_generado = True
        self.qr_fecha_generacion = timezone.now()
        self.save(update_fields=['qr_generado', 'qr_fecha_generacion'])