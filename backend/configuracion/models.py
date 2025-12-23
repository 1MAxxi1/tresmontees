from django.db import models
from usuarios.models import Usuario


class Sucursal(models.Model):
    """
    Modelo para gestionar las sucursales de la empresa
    """
    nombre = models.CharField(
        max_length=150,
        unique=True,
        verbose_name='Nombre de la Sucursal',
        help_text='Ej: Casablanca, Valparaíso – Planta BIF'
    )
    codigo = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Código',
        help_text='Código interno de la sucursal (ej: CASA, VBIF, VBIC)'
    )
    direccion = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Dirección',
        help_text='Dirección física de la sucursal'
    )
    activa = models.BooleanField(
        default=True,
        verbose_name='Activa',
        help_text='Indica si la sucursal está activa'
    )
    
    # Auditoría
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sucursales_creadas',
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
        db_table = 'sucursales'
        verbose_name = 'Sucursal'
        verbose_name_plural = 'Sucursales'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre
    
    @property
    def total_trabajadores(self):
        """Cuenta trabajadores asignados a esta sucursal"""
        from trabajadores.models import Trabajador
        return Trabajador.objects.filter(sede=self.nombre, activo=True).count()
    
    @property
    def total_trabajadores_inactivos(self):
        """Cuenta trabajadores inactivos de esta sucursal"""
        from trabajadores.models import Trabajador
        return Trabajador.objects.filter(sede=self.nombre, activo=False).count()
    
    @property
    def puede_desactivarse(self):
        """Verifica si la sucursal puede desactivarse"""
        # No se puede desactivar si tiene trabajadores activos
        if self.total_trabajadores > 0:
            return False, "La sucursal tiene trabajadores activos asignados"
        
        # Verificar si hay campañas activas
        from campanas.models import CampanaEntrega
        campanas_activas = CampanaEntrega.objects.filter(
            sucursal=self.codigo.lower(),
            activa=True
        ).count()
        
        if campanas_activas > 0:
            return False, f"Hay {campanas_activas} campaña(s) activa(s) en esta sucursal"
        
        return True, "Puede desactivarse"


class Area(models.Model):
    """
    Modelo para gestionar las áreas/departamentos de la empresa
    """
    nombre = models.CharField(
        max_length=150,
        unique=True,
        verbose_name='Nombre del Área',
        help_text='Ej: Producción y Manufactura, Logística'
    )
    codigo = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Código',
        help_text='Código interno del área (ej: produccion_manufactura)'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción',
        help_text='Descripción del área o departamento'
    )
    activa = models.BooleanField(
        default=True,
        verbose_name='Activa',
        help_text='Indica si el área está activa'
    )
    
    # Auditoría
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='areas_creadas',
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
        db_table = 'areas'
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre
    
    @property
    def total_trabajadores(self):
        """Cuenta trabajadores asignados a esta área"""
        from trabajadores.models import Trabajador
        return Trabajador.objects.filter(area=self.codigo, activo=True).count()
    
    @property
    def total_trabajadores_inactivos(self):
        """Cuenta trabajadores inactivos de esta área"""
        from trabajadores.models import Trabajador
        return Trabajador.objects.filter(area=self.codigo, activo=False).count()
    
    @property
    def puede_desactivarse(self):
        """Verifica si el área puede desactivarse"""
        # No se puede desactivar si tiene trabajadores activos
        if self.total_trabajadores > 0:
            return False, "El área tiene trabajadores activos asignados"
        
        return True, "Puede desactivarse"