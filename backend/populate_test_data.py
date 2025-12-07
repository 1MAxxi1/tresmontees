"""
Script para poblar la base de datos con datos de prueba
Ejecutar: python populate_test_data.py
"""

import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usuarios.models import Usuario
from trabajadores.models import Trabajador
from cajas.models import Caja
from django.contrib.auth.hashers import make_password

def create_users():
    """Crear usuarios de prueba"""
    print("Creando usuarios...")
    
    # Guardias
    Usuario.objects.create(
        username='guardia01',
        password=make_password('password123'),
        first_name='Pedro',
        last_name='González',
        email='pedro.gonzalez@tresmontees.cl',
        rol='guardia',
        telefono='+56912345678'
    )
    
    Usuario.objects.create(
        username='guardia02',
        password=make_password('password123'),
        first_name='María',
        last_name='Silva',
        email='maria.silva@tresmontees.cl',
        rol='guardia',
        telefono='+56987654321'
    )
    
    # Supervisor
    Usuario.objects.create(
        username='supervisor01',
        password=make_password('password123'),
        first_name='Carlos',
        last_name='Ramírez',
        email='carlos.ramirez@tresmontees.cl',
        rol='supervisor',
        telefono='+56911223344'
    )
    
    # RRHH
    Usuario.objects.create(
        username='rrhh01',
        password=make_password('password123'),
        first_name='Ana',
        last_name='Martínez',
        email='ana.martinez@tresmontees.cl',
        rol='rrhh',
        telefono='+56955667788'
    )
    
    print("✅ Usuarios creados")

def create_trabajadores():
    """Crear trabajadores de prueba"""
    print("Creando trabajadores...")
    
    trabajadores_data = [
        # Casablanca - Indefinidos
        {
            'rut': '12345678-9',
            'nombre': 'Juan',
            'apellido': 'Pérez',
            'email': 'juan.perez@empresa.cl',
            'telefono': '+56911111111',
            'tipo_contrato': 'indefinido',
            'sucursal': 'casablanca',
            'area': 'Producción',
            'fecha_ingreso': date(2023, 1, 15)
        },
        {
            'rut': '23456789-0',
            'nombre': 'María',
            'apellido': 'López',
            'email': 'maria.lopez@empresa.cl',
            'telefono': '+56922222222',
            'tipo_contrato': 'indefinido',
            'sucursal': 'casablanca',
            'area': 'Logística',
            'fecha_ingreso': date(2023, 3, 20)
        },
        # Casablanca - Plazo
        {
            'rut': '34567890-1',
            'nombre': 'Carlos',
            'apellido': 'Rodríguez',
            'email': 'carlos.rodriguez@empresa.cl',
            'telefono': '+56933333333',
            'tipo_contrato': 'plazo',
            'sucursal': 'casablanca',
            'area': 'Producción',
            'fecha_ingreso': date(2024, 1, 10)
        },
        {
            'rut': '45678901-2',
            'nombre': 'Laura',
            'apellido': 'Fernández',
            'email': 'laura.fernandez@empresa.cl',
            'telefono': '+56944444444',
            'tipo_contrato': 'plazo',
            'sucursal': 'casablanca',
            'area': 'Calidad',
            'fecha_ingreso': date(2024, 2, 15)
        },
        # Valparaíso BIF - Indefinidos
        {
            'rut': '56789012-3',
            'nombre': 'Diego',
            'apellido': 'Sánchez',
            'email': 'diego.sanchez@empresa.cl',
            'telefono': '+56955555555',
            'tipo_contrato': 'indefinido',
            'sucursal': 'bif',
            'area': 'Producción',
            'fecha_ingreso': date(2022, 6, 1)
        },
        {
            'rut': '67890123-4',
            'nombre': 'Andrea',
            'apellido': 'Torres',
            'email': 'andrea.torres@empresa.cl',
            'telefono': '+56966666666',
            'tipo_contrato': 'indefinido',
            'sucursal': 'bif',
            'area': 'Administración',
            'fecha_ingreso': date(2023, 8, 10)
        },
        # Valparaíso BIF - Plazo
        {
            'rut': '78901234-5',
            'nombre': 'Roberto',
            'apellido': 'Muñoz',
            'email': 'roberto.munoz@empresa.cl',
            'telefono': '+56977777777',
            'tipo_contrato': 'plazo',
            'sucursal': 'bif',
            'area': 'Mantenimiento',
            'fecha_ingreso': date(2024, 3, 1)
        },
        # Valparaíso BIC - Indefinidos
        {
            'rut': '89012345-6',
            'nombre': 'Claudia',
            'apellido': 'Vargas',
            'email': 'claudia.vargas@empresa.cl',
            'telefono': '+56988888888',
            'tipo_contrato': 'indefinido',
            'sucursal': 'bic',
            'area': 'Producción',
            'fecha_ingreso': date(2023, 4, 20)
        },
        {
            'rut': '90123456-7',
            'nombre': 'Javier',
            'apellido': 'Reyes',
            'email': 'javier.reyes@empresa.cl',
            'telefono': '+56999999999',
            'tipo_contrato': 'indefinido',
            'sucursal': 'bic',
            'area': 'Logística',
            'fecha_ingreso': date(2022, 11, 5)
        },
        # Valparaíso BIC - Plazo
        {
            'rut': '01234567-8',
            'nombre': 'Patricia',
            'apellido': 'Castro',
            'email': 'patricia.castro@empresa.cl',
            'telefono': '+56900000000',
            'tipo_contrato': 'plazo',
            'sucursal': 'bic',
            'area': 'Calidad',
            'fecha_ingreso': date(2024, 5, 1)
        },
    ]
    
    for data in trabajadores_data:
        Trabajador.objects.create(**data)
    
    print(f"✅ {len(trabajadores_data)} trabajadores creados")

def create_cajas():
    """Crear cajas de prueba"""
    print("Creando cajas...")
    
    cajas_data = [
        # Casablanca - Indefinidos
        {
            'codigo': 'CAJA-CASA-IND-001',
            'tipo_contrato': 'indefinido',
            'sucursal': 'casablanca',
            'cantidad_disponible': 150
        },
        {
            'codigo': 'CAJA-CASA-IND-002',
            'tipo_contrato': 'indefinido',
            'sucursal': 'casablanca',
            'cantidad_disponible': 200
        },
        # Casablanca - Plazo Fijo
        {
            'codigo': 'CAJA-CASA-PLAZO-001',
            'tipo_contrato': 'plazo_fijo',
            'sucursal': 'casablanca',
            'cantidad_disponible': 100
        },
        {
            'codigo': 'CAJA-CASA-PLAZO-002',
            'tipo_contrato': 'plazo_fijo',
            'sucursal': 'casablanca',
            'cantidad_disponible': 75
        },
        # Valparaíso BIF - Indefinidos
        {
            'codigo': 'CAJA-BIF-IND-001',
            'tipo_contrato': 'indefinido',
            'sucursal': 'valparaiso_bif',
            'cantidad_disponible': 120
        },
        {
            'codigo': 'CAJA-BIF-IND-002',
            'tipo_contrato': 'indefinido',
            'sucursal': 'valparaiso_bif',
            'cantidad_disponible': 180
        },
        # Valparaíso BIF - Plazo Fijo
        {
            'codigo': 'CAJA-BIF-PLAZO-001',
            'tipo_contrato': 'plazo_fijo',
            'sucursal': 'valparaiso_bif',
            'cantidad_disponible': 90
        },
        # Valparaíso BIC - Indefinidos
        {
            'codigo': 'CAJA-BIC-IND-001',
            'tipo_contrato': 'indefinido',
            'sucursal': 'valparaiso_bic',
            'cantidad_disponible': 160
        },
        {
            'codigo': 'CAJA-BIC-IND-002',
            'tipo_contrato': 'indefinido',
            'sucursal': 'valparaiso_bic',
            'cantidad_disponible': 140
        },
        # Valparaíso BIC - Plazo Fijo
        {
            'codigo': 'CAJA-BIC-PLAZO-001',
            'tipo_contrato': 'plazo_fijo',
            'sucursal': 'valparaiso_bic',
            'cantidad_disponible': 80
        },
    ]
    
    for data in cajas_data:
        Caja.objects.create(**data)
    
    print(f"✅ {len(cajas_data)} cajas creadas")

def main():
    """Función principal"""
    print("\n" + "="*60)
    print("POBLANDO BASE DE DATOS CON DATOS DE PRUEBA")
    print("="*60 + "\n")
    
    # Eliminar datos existentes
    print("Limpiando base de datos...")
    Usuario.objects.all().delete()
    Trabajador.objects.all().delete()
    Caja.objects.all().delete()
    print("✅ Base de datos limpiada\n")
    
    # Crear datos de prueba
    create_users()
    create_trabajadores()
    create_cajas()
    
    print("\n" + "="*60)
    print("✅ BASE DE DATOS POBLADA EXITOSAMENTE")
    print("="*60)
    print("\n📋 RESUMEN:")
    print(f"   - {Usuario.objects.count()} usuarios")
    print(f"   - {Trabajador.objects.count()} trabajadores")
    print(f"   - {Caja.objects.count()} cajas")
    print("\n🔑 CREDENCIALES DE ACCESO:")
    print("   Guardia:    guardia01 / password123")
    print("   Guardia:    guardia02 / password123")
    print("   Supervisor: supervisor01 / password123")
    print("   RRHH:       rrhh01 / password123")
    print("\n💡 TIP: Prueba validar el trabajador con RUT: 12345678-9")
    print("        y la caja con código: CAJA-CASA-IND-001")
    print("\n")

if __name__ == '__main__':
    main()
