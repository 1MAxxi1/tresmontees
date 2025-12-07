import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from trabajadores.models import Trabajador

print("=" * 80)
print("POBLANDO BASE DE DATOS MYSQL CON TRABAJADORES DE PRUEBA")
print("=" * 80)

trabajadores_prueba = [
    {
        'rut': '12345678-9',
        'nombre': 'Juan',
        'apellido_paterno': 'Pérez',
        'apellido_materno': 'González',
        'cargo': 'Operario de Producción',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '98765432-1',
        'nombre': 'María',
        'apellido_paterno': 'González',
        'apellido_materno': 'López',
        'cargo': 'Supervisor de Turno',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '11223344-5',
        'nombre': 'Pedro',
        'apellido_paterno': 'Rodríguez',
        'apellido_materno': 'Martínez',
        'cargo': 'Operario de Mantención',
        'tipo_contrato': 'plazo_fijo',
        'periodo': 'Junio 2024 - Diciembre 2024',
        'sede': 'Sucursal Norte',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '55667788-9',
        'nombre': 'Ana',
        'apellido_paterno': 'Martínez',
        'apellido_materno': 'Silva',
        'cargo': 'Jefe de Producción',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Sucursal Sur',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '99887766-5',
        'nombre': 'Carlos',
        'apellido_paterno': 'López',
        'apellido_materno': 'Ramírez',
        'cargo': 'Operario de Calidad',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '12121212-1',
        'nombre': 'Sofía',
        'apellido_paterno': 'Ramírez',
        'apellido_materno': 'Torres',
        'cargo': 'Operario de Bodega',
        'tipo_contrato': 'plazo_fijo',
        'periodo': 'Marzo 2024 - Septiembre 2024',
        'sede': 'Sucursal Norte',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '34343434-3',
        'nombre': 'Diego',
        'apellido_paterno': 'Flores',
        'apellido_materno': 'Vega',
        'cargo': 'Supervisor de Calidad',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Sucursal Sur',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '56565656-5',
        'nombre': 'Valentina',
        'apellido_paterno': 'Torres',
        'apellido_materno': 'Castro',
        'cargo': 'Operario de Envasado',
        'tipo_contrato': 'plazo_fijo',
        'periodo': 'Abril 2024 - Octubre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '78787878-7',
        'nombre': 'Matías',
        'apellido_paterno': 'Vega',
        'apellido_materno': 'Muñoz',
        'cargo': 'Operario de Logística',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Sucursal Norte',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '19191919-9',
        'nombre': 'Camila',
        'apellido_paterno': 'Soto',
        'apellido_materno': 'Reyes',
        'cargo': 'Jefe de Turno',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Sucursal Sur',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '20202020-2',
        'nombre': 'Sebastián',
        'apellido_paterno': 'Morales',
        'apellido_materno': 'Núñez',
        'cargo': 'Operario de Producción',
        'tipo_contrato': 'plazo_fijo',
        'periodo': 'Mayo 2024 - Noviembre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '31313131-3',
        'nombre': 'Francisca',
        'apellido_paterno': 'Contreras',
        'apellido_materno': 'Rojas',
        'cargo': 'Supervisor de Bodega',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Sucursal Norte',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '42424242-4',
        'nombre': 'Joaquín',
        'apellido_paterno': 'Herrera',
        'apellido_materno': 'Pinto',
        'cargo': 'Operario de Mantención',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '53535353-5',
        'nombre': 'Isidora',
        'apellido_paterno': 'Fuentes',
        'apellido_materno': 'Bravo',
        'cargo': 'Operario de Calidad',
        'tipo_contrato': 'plazo_fijo',
        'periodo': 'Febrero 2024 - Agosto 2024',
        'sede': 'Sucursal Sur',
        'estado': 'pendiente',
        'activo': True
    },
    {
        'rut': '64646464-6',
        'nombre': 'Benjamín',
        'apellido_paterno': 'Valdés',
        'apellido_materno': 'Sepúlveda',
        'cargo': 'Jefe de Mantención',
        'tipo_contrato': 'indefinido',
        'periodo': 'Enero 2024 - Diciembre 2024',
        'sede': 'Casa Matriz',
        'estado': 'pendiente',
        'activo': True
    }
]

creados = 0
existentes = 0
errores = 0

for datos in trabajadores_prueba:
    try:
        trabajador, created = Trabajador.objects.get_or_create(
            rut=datos['rut'],
            defaults=datos
        )
        
        if created:
            print(f"✓ Creado: {trabajador.nombre_completo} - RUT: {trabajador.rut} - {trabajador.cargo}")
            creados += 1
        else:
            print(f"- Ya existe: {trabajador.nombre_completo} - RUT: {trabajador.rut}")
            existentes += 1
    except Exception as e:
        print(f"✗ Error con RUT {datos['rut']}: {str(e)}")
        errores += 1

print("\n" + "=" * 80)
print(f"Trabajadores creados: {creados}")
print(f"Trabajadores existentes: {existentes}")
print(f"Errores: {errores}")
print(f"Total en base de datos: {Trabajador.objects.count()}")
print("=" * 80)

print("\n📋 LISTADO DE TRABAJADORES POR SEDE:")
print("=" * 80)

sedes = Trabajador.objects.values_list('sede', flat=True).distinct()

for sede in sedes:
    trabajadores_sede = Trabajador.objects.filter(sede=sede).order_by('apellido_paterno')
    print(f"\n{sede.upper()} ({trabajadores_sede.count()} trabajadores):")
    print("-" * 80)
    
    for t in trabajadores_sede:
        contrato = "Indefinido" if t.tipo_contrato == 'indefinido' else "A Plazo"
        estado = "✓ Retirado" if t.estado == 'retirado' else "○ Pendiente"
        print(f"  {t.rut:<15} {t.nombre_completo:<40} {t.cargo:<30} [{contrato}] {estado}")

print("\n" + "=" * 80)
print("RUTs DISPONIBLES PARA GENERAR CÓDIGOS QR:")
print("=" * 80)
for t in Trabajador.objects.all().order_by('rut'):
    print(f"  {t.rut}")
print("=" * 80)