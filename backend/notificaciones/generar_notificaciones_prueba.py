# ⚠️ SCRIPT SOLO PARA PRUEBAS - NO USAR EN PRODUCCIÓN
# Este script genera notificaciones de prueba para verificar el funcionamiento
# En producción, las notificaciones se generan AUTOMÁTICAMENTE por eventos reales

# Ejecutar SOLO si quieres ver ejemplos:
# python manage.py shell < generar_notificaciones_prueba.py

from notificaciones.models import Notificacion
from trabajadores.models import Trabajador
from datetime import date, timedelta

print("⚠️  GENERANDO NOTIFICACIONES DE PRUEBA (SOLO PARA DESARROLLO)")
print("=" * 60)

# 1. Resumen de entregas
Notificacion.crear_resumen_entregas(
    fecha=date.today(),
    total_entregas=15,
    sucursales_detalle={
        'Casablanca': 8,
        'Valparaíso BIF': 5,
        'Valparaíso BIC': 2
    }
)
print("✅ Notificación de resumen de entregas creada")

# 2. Stock bajo - Alta prioridad
Notificacion.crear_stock_bajo(
    sucursal='Casablanca',
    tipo_contrato='Indefinido',
    cantidad=3
)
print("✅ Notificación de stock bajo (alta prioridad) creada")

# 3. Stock bajo - Media prioridad
Notificacion.crear_stock_bajo(
    sucursal='Valparaíso BIF',
    tipo_contrato='Plazo Fijo',
    cantidad=8
)
print("✅ Notificación de stock bajo (media prioridad) creada")

# 4. Campaña próxima a vencer - Alta prioridad
from campanas.models import CampanaEntrega
campanas = CampanaEntrega.objects.filter(activa=True).first()
if campanas:
    Notificacion.crear_campana_vence(
        campana=campanas,
        dias_restantes=2
    )
    print("✅ Notificación de campaña próxima a vencer creada")
else:
    print("⚠️  No hay campañas activas para notificación")

# 5. Trabajador nuevo
trabajador = Trabajador.objects.first()
if trabajador:
    Notificacion.crear_trabajador_nuevo(trabajador)
    print("✅ Notificación de trabajador nuevo creada")
else:
    print("⚠️  No hay trabajadores para notificación")

# 6. Incidencia nueva (si existe el modelo)
try:
    from incidencias.models import Incidencia
    incidencia = Incidencia.objects.first()
    if incidencia:
        Notificacion.crear_incidencia_nueva(incidencia)
        print("✅ Notificación de incidencia nueva creada")
    else:
        print("⚠️  No hay incidencias para notificación")
except:
    print("⚠️  Modelo Incidencia no disponible")

print("\n🎉 Notificaciones de prueba generadas correctamente!")
print(f"Total: {Notificacion.objects.count()} notificaciones")
print("\n⚠️  IMPORTANTE:")
print("   Estas son notificaciones DE PRUEBA")
print("   En producción, se generan automáticamente por eventos reales:")
print("   - Entregas realizadas → Resumen diario")
print("   - Stock bajo → Monitor automático")
print("   - Campañas → Monitor de fechas")
print("   - Incidencias → Al reportar una nueva")
print("   - Trabajadores → Al crear uno sin área")