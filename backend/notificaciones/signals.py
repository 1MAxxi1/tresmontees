from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import date
from entregas.models import Entrega
from .models import Notificacion


@receiver(post_save, sender=Entrega)
def crear_notificacion_entrega(sender, instance, created, **kwargs):
    """
    Crear notificación cuando se realiza una entrega.
    
    IMPORTANTE: No crea una notificación por cada entrega individual
    (eso sería spam). En su lugar, podríamos:
    
    1. No crear notificación aquí (el resumen diario se encarga)
    2. Crear notificación solo para entregas especiales
    3. Crear notificación de incidencia si hay problema
    
    Por ahora, lo desactivamos para evitar spam.
    El resumen diario de entregas se genera con un comando programado.
    """
    
    # OPCIÓN 1: Desactivar completamente (RECOMENDADO)
    # No hacer nada - el resumen diario se encarga
    pass
    
    # OPCIÓN 2: Crear notificación solo si hay observaciones importantes
    # if created and instance.observaciones and len(instance.observaciones) > 20:
    #     # Hay una observación importante
    #     Notificacion.objects.create(
    #         tipo='incidencia_nueva',
    #         titulo='⚠️ Entrega con Observación',
    #         mensaje=f'Entrega a {instance.trabajador.nombre_completo}: {instance.observaciones[:100]}',
    #         prioridad='media',
    #         datos_extra={
    #             'entrega_id': instance.id,
    #             'trabajador': instance.trabajador.nombre_completo,
    #             'caja': instance.caja.codigo if instance.caja else 'N/A',
    #             'sucursal': instance.caja.get_sucursal_display() if instance.caja else None,
    #         }
    #     )
    
    # OPCIÓN 3: Actualizar contador diario (más eficiente)
    # Se puede implementar un contador que se actualiza y al final del día
    # se genera el resumen automáticamente


# NUEVO: Signal para detectar stock bajo después de una entrega
@receiver(post_save, sender=Entrega)
def verificar_stock_bajo(sender, instance, created, **kwargs):
    """
    Verificar si el stock de cajas está bajo después de una entrega.
    Crear notificación si el stock está crítico.
    """
    if created and instance.caja:
        caja = instance.caja
        stock_actual = caja.cantidad_disponible
        
        # Si el stock está bajo (menos de 10 cajas)
        if stock_actual > 0 and stock_actual <= 10:
            # Verificar si ya existe una notificación reciente de stock bajo
            from datetime import timedelta
            hace_una_semana = timezone.now() - timedelta(days=7)
            
            existe_notificacion = Notificacion.objects.filter(
                tipo='stock_bajo',
                datos_extra__sucursal=caja.get_sucursal_display(),
                datos_extra__tipo_contrato=caja.get_tipo_contrato_display(),
                creado_en__gte=hace_una_semana
            ).exists()
            
            # Solo crear notificación si no existe una reciente
            if not existe_notificacion:
                Notificacion.crear_stock_bajo(
                    sucursal=caja.get_sucursal_display(),
                    tipo_contrato=caja.get_tipo_contrato_display(),
                    cantidad=stock_actual
                )