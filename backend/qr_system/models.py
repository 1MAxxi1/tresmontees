from django.db import models
from trabajadores.models import Trabajador
import uuid

QR_ESTADOS = (
    ('NO_GENERADO', 'No generado'),
    ('GENERADO', 'Generado'),
    ('ENVIADO', 'Enviado'),
)

class QRRegistro(models.Model):
    trabajador = models.OneToOneField(
        Trabajador, 
        on_delete=models.CASCADE, 
        related_name="qr_registro"
    )

    codigo_unico = models.UUIDField(default=uuid.uuid4, editable=False)
    hash_validacion = models.CharField(max_length=256, blank=True)

    fecha_generado = models.DateTimeField(null=True, blank=True)
    fecha_enviado = models.DateTimeField(null=True, blank=True)

    estado = models.CharField(
        max_length=20, 
        choices=QR_ESTADOS, 
        default='NO_GENERADO'
    )

    qr_imagen = models.ImageField(upload_to="qr_codes/", null=True, blank=True)

    enviado_email = models.BooleanField(default=False)

    class Meta:
        db_table = 'qr_registros'
        verbose_name = 'Registro QR'
        verbose_name_plural = 'Registros QR'

    def __str__(self):
        return f"QR {self.trabajador.nombre} {self.trabajador.apellido_paterno}"