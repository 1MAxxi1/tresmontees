from django.db.models.signals import post_save
from django.dispatch import receiver
from entregas.models import Entrega
from .models import Notificacion


@receiver(post_save, sender=Entrega)
def crear_notificacion_entrega(sender, instance, created, **kwargs):
    """Crear notificación cuando se realiza una entrega"""
    if created:
        Notificacion.objects.create(
            trabajador=instance.trabajador,
            titulo="Entrega Registrada",
            mensaje=f"Se ha registrado la entrega de la caja {instance.caja.codigo if instance.caja else 'N/A'}",
            tipo="entrega"
        )