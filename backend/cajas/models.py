from django.db import models

class Caja(models.Model):
    CONTRATO_CHOICES = [
        ('indefinido', 'Indefinido'),
        ('plazo_fijo', 'Plazo Fijo'),
    ]
    
    SUCURSAL_CHOICES = [
        ('casablanca', 'Casablanca'),
        ('valparaiso_bif', 'Valparaíso – Planta BIF'),
        ('valparaiso_bic', 'Valparaíso – Planta BIC'),
    ]
    
    codigo = models.CharField(max_length=50, unique=True)
    tipo_contrato = models.CharField(max_length=20, choices=CONTRATO_CHOICES)
    sucursal = models.CharField(max_length=50, choices=SUCURSAL_CHOICES)
    cantidad_disponible = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.codigo} - {self.get_sucursal_display()} ({self.tipo_contrato})"
    
    class Meta:
        verbose_name = 'Caja'
        verbose_name_plural = 'Cajas'