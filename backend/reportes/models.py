from django.db import models
import uuid
from django.utils import timezone

class Reporte(models.Model):
    TIPOS_REPORTE = [
        ('entregas', 'Entregas'),
        ('trabajadores', 'Trabajadores'),
        ('incidencias', 'Incidencias'),
        ('stock', 'Stock de Cajas'),
        ('auditoria', 'Auditoría'),
    ]
    
    FORMATOS = [
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
        ('csv', 'CSV'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TIPOS_REPORTE)
    formato = models.CharField(max_length=10, choices=FORMATOS, default='excel')
    activo = models.BooleanField(default=True)
    
    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reportes'
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"


class EjecucionReporte(models.Model):
    ESTADOS_EJECUCION = [
        ('pendiente', 'Pendiente'),
        ('procesando', 'Procesando'),
        ('completado', 'Completado'),
        ('fallido', 'Fallido'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporte = models.ForeignKey(Reporte, on_delete=models.CASCADE, related_name='ejecuciones')
    estado = models.CharField(max_length=20, choices=ESTADOS_EJECUCION, default='pendiente')
    archivo_nombre = models.CharField(max_length=500, blank=True, null=True)
    
    # Fechas
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    
    # Errores
    error = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'ejecuciones_reportes'
        ordering = ['-fecha_solicitud']
    
    def __str__(self):
        return f"Ejecución {self.id} - {self.reporte.nombre}"