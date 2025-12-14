from django.db import models
from trabajadores.models import Trabajador


class Notificacion(models.Model):
    TIPOS = [
        ("info", "Información"),
        ("warning", "Advertencia"),
        ("success", "Éxito"),
        ("entrega", "Entrega"),
    ]

    trabajador = models.ForeignKey(
        Trabajador,
        on_delete=models.CASCADE,
        related_name="notificaciones",
        null=True,
        blank=True
    )

    titulo = models.CharField(max_length=255)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPOS, default="info")
    leido = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]
        db_table = 'notificaciones'

    def __str__(self):
        if self.trabajador:
            target = f"{self.trabajador.nombre} {self.trabajador.apellido_paterno}"
        else:
            target = "Todos"
        return f"{target} - {self.titulo}"