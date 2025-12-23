from django.db import models
from usuarios.models import Usuario


class CampanaEntrega(models.Model):
    """
    Modelo para gestionar campañas de entrega de cajas de seguridad
    """
    
    SUCURSAL_CHOICES = [
        ('casablanca', 'Casablanca'),
        ('valparaiso_bif', 'Valparaíso – Planta BIF'),
        ('valparaiso_bic', 'Valparaíso – Planta BIC'),
    ]
    
    TIPO_ENTREGA_CHOICES = [
        ('general', 'General (Todas las áreas)'),
        ('grupo', 'Por Grupo (Áreas específicas)'),
    ]
    
    TIPO_CONTRATO_CHOICES = [
        ('indefinido', 'Indefinido'),
        ('plazo_fijo', 'Plazo Fijo'),
    ]
    
    # Información de la Campaña
    nombre = models.CharField(
        max_length=200,
        verbose_name='Nombre de la Campaña',
        help_text='Ej: Entrega Navidad 2025'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción',
        help_text='Descripción opcional de la campaña'
    )
    
    # Configuración de la Campaña
    sucursal = models.CharField(
        max_length=50,
        choices=SUCURSAL_CHOICES,
        verbose_name='Sucursal'
    )
    tipo_entrega = models.CharField(
        max_length=50,
        choices=TIPO_ENTREGA_CHOICES,
        default='general',
        verbose_name='Tipo de Entrega'
    )
    areas_seleccionadas = models.JSONField(
        default=list,
        verbose_name='Áreas Seleccionadas',
        help_text='Lista de áreas habilitadas para esta campaña'
    )
    tipo_contrato = models.JSONField(
        default=list,
        verbose_name='Tipos de Contrato',
        help_text='Lista de tipos de contrato habilitados: indefinido, plazo_fijo'
    )
    
    # Fechas
    fecha_inicio = models.DateField(
        verbose_name='Fecha de Inicio'
    )
    fecha_fin = models.DateField(
        verbose_name='Fecha de Fin'
    )
    
    # Estado
    activa = models.BooleanField(
        default=True,
        verbose_name='Activa',
        help_text='Indica si la campaña está actualmente activa'
    )
    
    # Auditoría
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='campanas_creadas',
        verbose_name='Creado Por'
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
        db_table = 'campanas_entrega'
        verbose_name = 'Campaña de Entrega'
        verbose_name_plural = 'Campañas de Entrega'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.nombre} - {self.get_sucursal_display()}"
    
    @property
    def esta_vigente(self):
        """Verifica si la campaña está dentro del período de vigencia"""
        from django.utils import timezone
        hoy = timezone.now().date()
        return self.activa and self.fecha_inicio <= hoy <= self.fecha_fin
    
    def get_areas_display(self):
        """Retorna las áreas seleccionadas en formato legible"""
        AREAS_MAP = {
            'produccion_manufactura': 'Producción y Manufactura',
            'logistica_distribucion': 'Logística y Distribución',
            'administracion': 'Administración',
            'rrhh': 'Recursos Humanos',
            'ingenieria_practicas': 'Ingeniería y Prácticas',
        }
        
        if self.tipo_entrega == 'general':
            return 'Todas las áreas'
        
        return ', '.join([AREAS_MAP.get(area, area) for area in self.areas_seleccionadas])
    
    def trabajador_puede_retirar(self, trabajador):
        """
        Verifica si un trabajador puede retirar caja en esta campaña
        """
        # Verificar si la campaña está vigente
        if not self.esta_vigente:
            return False, "La campaña no está vigente"
        
        # Verificar sucursal
        if trabajador.sede.lower() != self.get_sucursal_display().lower():
            return False, "El trabajador no pertenece a la sucursal de esta campaña"
        
        # Verificar tipo de contrato (ahora es una lista)
        if trabajador.tipo_contrato not in self.tipo_contrato:
            contratos_str = ', '.join([self.TIPO_CONTRATO_CHOICES_MAP.get(c, c) for c in self.tipo_contrato])
            return False, f"Esta campaña es solo para trabajadores con contrato: {contratos_str}"
        
        # Verificar área (solo si es por grupo)
        if self.tipo_entrega == 'grupo':
            if trabajador.area not in self.areas_seleccionadas:
                return False, "El trabajador no pertenece a un área habilitada en esta campaña"
        
        return True, "El trabajador puede retirar"
    
    TIPO_CONTRATO_CHOICES_MAP = {
        'indefinido': 'Indefinido',
        'plazo_fijo': 'Plazo Fijo',
    }
    
    def contar_trabajadores_elegibles(self):
        """
        Cuenta cuántos trabajadores son elegibles para esta campaña
        """
        from trabajadores.models import Trabajador
        
        # Mapear sucursal de campaña a sede de trabajador
        SUCURSAL_TO_SEDE = {
            'casablanca': 'Casablanca',
            'valparaiso_bif': 'Valparaíso – Planta BIF',
            'valparaiso_bic': 'Valparaíso – Planta BIC',
        }
        
        sede_trabajador = SUCURSAL_TO_SEDE.get(self.sucursal, self.sucursal)
        
        trabajadores = Trabajador.objects.filter(
            sede=sede_trabajador,
            tipo_contrato__in=self.tipo_contrato,  # Cambiado a __in para lista
            activo=True
        )
        
        # Si es por grupo, filtrar por áreas
        if self.tipo_entrega == 'grupo':
            trabajadores = trabajadores.filter(area__in=self.areas_seleccionadas)
        
        return trabajadores.count()
    
    def contar_entregas_realizadas(self):
        """
        Cuenta cuántas entregas se han realizado en esta campaña
        """
        from entregas.models import Entrega
        
        # Mapear sucursal
        SUCURSAL_TO_SEDE = {
            'casablanca': 'Casablanca',
            'valparaiso_bif': 'Valparaíso – Planta BIF',
            'valparaiso_bic': 'Valparaíso – Planta BIC',
        }
        
        sede_trabajador = SUCURSAL_TO_SEDE.get(self.sucursal, self.sucursal)
        
        entregas = Entrega.objects.filter(
            trabajador__sede=sede_trabajador,
            trabajador__tipo_contrato__in=self.tipo_contrato,  # Cambiado a __in para lista
            fecha_entrega__date__gte=self.fecha_inicio,
            fecha_entrega__date__lte=self.fecha_fin
        )
        
        # Si es por grupo, filtrar por áreas
        if self.tipo_entrega == 'grupo':
            entregas = entregas.filter(trabajador__area__in=self.areas_seleccionadas)
        
        return entregas.count()
    
    def get_tipos_contrato_display(self):
        """Retorna los tipos de contrato en formato legible"""
        TIPOS_MAP = {
            'indefinido': 'Indefinido',
            'plazo_fijo': 'Plazo Fijo',
        }
        
        # Validar que tipo_contrato existe y es una lista
        if not self.tipo_contrato or len(self.tipo_contrato) == 0:
            return 'No especificado'
        
        # Construir la lista de nombres
        nombres = []
        for tipo in self.tipo_contrato:
            nombre = TIPOS_MAP.get(tipo, tipo)
            nombres.append(nombre)
        
        # Retornar unidos con "/"
        return ' / '.join(nombres)