import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from cajas.models import Caja

print("=" * 80)
print("POBLANDO BASE DE DATOS CON CAJAS DE ENTREGA")
print("=" * 80)

cajas_prueba = [
    # ========================================
    # CAJAS CASABLANCA
    # ========================================
    
    # CASABLANCA - INDEFINIDO
    {
        'codigo': 'CAJA-CB-IND-001',
        'tipo_contrato': 'indefinido',
        'sucursal': 'casablanca',
        'cantidad_disponible': 50,
        'activa': True
    },
    {
        'codigo': 'CAJA-CB-IND-002',
        'tipo_contrato': 'indefinido',
        'sucursal': 'casablanca',
        'cantidad_disponible': 50,
        'activa': True
    },
    {
        'codigo': 'CAJA-CB-IND-003',
        'tipo_contrato': 'indefinido',
        'sucursal': 'casablanca',
        'cantidad_disponible': 50,
        'activa': True
    },
    
    # CASABLANCA - PLAZO FIJO
    {
        'codigo': 'CAJA-CB-PLZ-001',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'casablanca',
        'cantidad_disponible': 30,
        'activa': True
    },
    {
        'codigo': 'CAJA-CB-PLZ-002',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'casablanca',
        'cantidad_disponible': 30,
        'activa': True
    },
    {
        'codigo': 'CAJA-CB-PLZ-003',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'casablanca',
        'cantidad_disponible': 30,
        'activa': True
    },
    
    # ========================================
    # CAJAS VALPARAÍSO BIF
    # ========================================
    
    # VALPARAÍSO BIF - INDEFINIDO
    {
        'codigo': 'CAJA-VBIF-IND-001',
        'tipo_contrato': 'indefinido',
        'sucursal': 'valparaiso_bif',
        'cantidad_disponible': 40,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIF-IND-002',
        'tipo_contrato': 'indefinido',
        'sucursal': 'valparaiso_bif',
        'cantidad_disponible': 40,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIF-IND-003',
        'tipo_contrato': 'indefinido',
        'sucursal': 'valparaiso_bif',
        'cantidad_disponible': 40,
        'activa': True
    },
    
    # VALPARAÍSO BIF - PLAZO FIJO
    {
        'codigo': 'CAJA-VBIF-PLZ-001',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'valparaiso_bif',
        'cantidad_disponible': 25,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIF-PLZ-002',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'valparaiso_bif',
        'cantidad_disponible': 25,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIF-PLZ-003',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'valparaiso_bif',
        'cantidad_disponible': 25,
        'activa': True
    },
    
    # ========================================
    # CAJAS VALPARAÍSO BIC
    # ========================================
    
    # VALPARAÍSO BIC - INDEFINIDO
    {
        'codigo': 'CAJA-VBIC-IND-001',
        'tipo_contrato': 'indefinido',
        'sucursal': 'valparaiso_bic',
        'cantidad_disponible': 35,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIC-IND-002',
        'tipo_contrato': 'indefinido',
        'sucursal': 'valparaiso_bic',
        'cantidad_disponible': 35,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIC-IND-003',
        'tipo_contrato': 'indefinido',
        'sucursal': 'valparaiso_bic',
        'cantidad_disponible': 35,
        'activa': True
    },
    
    # VALPARAÍSO BIC - PLAZO FIJO
    {
        'codigo': 'CAJA-VBIC-PLZ-001',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'valparaiso_bic',
        'cantidad_disponible': 20,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIC-PLZ-002',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'valparaiso_bic',
        'cantidad_disponible': 20,
        'activa': True
    },
    {
        'codigo': 'CAJA-VBIC-PLZ-003',
        'tipo_contrato': 'plazo_fijo',
        'sucursal': 'valparaiso_bic',
        'cantidad_disponible': 20,
        'activa': True
    },
]

creadas = 0
existentes = 0
errores = 0

print("\n📦 CREANDO CAJAS...")
print("=" * 80)

for datos in cajas_prueba:
    try:
        caja, created = Caja.objects.get_or_create(
            codigo=datos['codigo'],
            defaults=datos
        )
        
        if created:
            tipo = "Indefinido" if caja.tipo_contrato == 'indefinido' else "Plazo Fijo"
            sucursal = caja.get_sucursal_display()
            print(f"✓ Creada: {caja.codigo:<20} | {sucursal:<30} | {tipo:<15} | Stock: {caja.cantidad_disponible}")
            creadas += 1
        else:
            print(f"- Ya existe: {caja.codigo}")
            existentes += 1
    except Exception as e:
        print(f"✗ Error con código {datos['codigo']}: {str(e)}")
        errores += 1

print("\n" + "=" * 80)
print(f"✅ Cajas creadas: {creadas}")
print(f"ℹ️  Cajas existentes: {existentes}")
print(f"❌ Errores: {errores}")
print(f"📊 Total en base de datos: {Caja.objects.count()}")
print("=" * 80)

# ========================================
# RESUMEN POR SUCURSAL
# ========================================
print("\n📊 RESUMEN POR SUCURSAL:")
print("=" * 80)

sucursales = [
    ('casablanca', 'CASABLANCA'),
    ('valparaiso_bif', 'VALPARAÍSO - PLANTA BIF'),
    ('valparaiso_bic', 'VALPARAÍSO - PLANTA BIC'),
]

for sucursal_code, sucursal_nombre in sucursales:
    cajas_sucursal = Caja.objects.filter(sucursal=sucursal_code)
    
    if cajas_sucursal.exists():
        print(f"\n🏢 {sucursal_nombre}")
        print("-" * 80)
        
        # Indefinido
        cajas_indefinido = cajas_sucursal.filter(tipo_contrato='indefinido')
        total_indefinido = sum(c.cantidad_disponible for c in cajas_indefinido)
        print(f"  📦 INDEFINIDO: {cajas_indefinido.count()} lotes - {total_indefinido} unidades disponibles")
        for c in cajas_indefinido:
            print(f"     • {c.codigo}: {c.cantidad_disponible} unidades")
        
        # Plazo Fijo
        cajas_plazo = cajas_sucursal.filter(tipo_contrato='plazo_fijo')
        total_plazo = sum(c.cantidad_disponible for c in cajas_plazo)
        print(f"  📦 PLAZO FIJO: {cajas_plazo.count()} lotes - {total_plazo} unidades disponibles")
        for c in cajas_plazo:
            print(f"     • {c.codigo}: {c.cantidad_disponible} unidades")

# ========================================
# CÓDIGOS QR PARA IMPRIMIR
# ========================================
print("\n" + "=" * 80)
print("📱 CÓDIGOS QR PARA GENERAR (ejemplos):")
print("=" * 80)

print("\n🏢 CASABLANCA:")
print("  Indefinido: CAJA-CB-IND-001")
print("  Plazo Fijo: CAJA-CB-PLZ-001")

print("\n🏢 VALPARAÍSO BIF:")
print("  Indefinido: CAJA-VBIF-IND-001")
print("  Plazo Fijo: CAJA-VBIF-PLZ-001")

print("\n🏢 VALPARAÍSO BIC:")
print("  Indefinido: CAJA-VBIC-IND-001")
print("  Plazo Fijo: CAJA-VBIC-PLZ-001")

print("\n💡 Genera códigos QR en: https://www.qr-code-generator.com/")

# ========================================
# TOTALES GENERALES
# ========================================
total_cajas = sum(c.cantidad_disponible for c in Caja.objects.all())
total_indefinido_general = sum(c.cantidad_disponible for c in Caja.objects.filter(tipo_contrato='indefinido'))
total_plazo_general = sum(c.cantidad_disponible for c in Caja.objects.filter(tipo_contrato='plazo_fijo'))

print("\n" + "=" * 80)
print("📊 TOTALES GENERALES:")
print("=" * 80)
print(f"  Total cajas disponibles: {total_cajas}")
print(f"  Indefinido: {total_indefinido_general}")
print(f"  Plazo Fijo: {total_plazo_general}")
print("=" * 80)