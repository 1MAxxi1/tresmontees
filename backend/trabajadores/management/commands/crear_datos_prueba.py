from django.core.management.base import BaseCommand
from trabajadores.models import Trabajador
from cajas.models import Caja


class Command(BaseCommand):
    help = 'Crea trabajadores y cajas de prueba en la base de datos'

    def handle(self, *args, **kwargs):
        self.stdout.write("\n" + "="*60)
        self.stdout.write("CREANDO TRABAJADORES Y CAJAS DE PRUEBA")
        self.stdout.write("="*60 + "\n")

        # ============================================
        # CREAR TRABAJADORES
        # ============================================

        trabajadores_data = [
            # CASABLANCA - INDEFINIDO
            {
                'rut': '23456789-0',
                'nombre': 'María',
                'apellido_paterno': 'Silva',
                'apellido_materno': 'Rojas',
                'cargo': 'Jefe de Turno',
                'tipo_contrato': 'indefinido',
                'sede': 'casablanca',
                'activo': True,
            },
            
            # CASABLANCA - PLAZO FIJO
            {
                'rut': '34567890-1',
                'nombre': 'Pedro',
                'apellido_paterno': 'Martínez',
                'apellido_materno': 'López',
                'cargo': 'Operario Temporal',
                'tipo_contrato': 'plazo_fijo',
                'sede': 'casablanca',
                'activo': True,
            },
            
            # VALPARAÍSO BIF - INDEFINIDO
            {
                'rut': '45678901-2',
                'nombre': 'Ana',
                'apellido_paterno': 'Ramírez',
                'apellido_materno': 'Flores',
                'cargo': 'Supervisor de Calidad',
                'tipo_contrato': 'indefinido',
                'sede': 'valparaiso_bif',
                'activo': True,
            },
            {
                'rut': '56789012-3',
                'nombre': 'Carlos',
                'apellido_paterno': 'López',
                'apellido_materno': 'Ramírez',
                'cargo': 'Operario de Bodega',
                'tipo_contrato': 'indefinido',
                'sede': 'valparaiso_bif',
                'activo': True,
            },
            
            # VALPARAÍSO BIF - PLAZO FIJO
            {
                'rut': '67890123-4',
                'nombre': 'Laura',
                'apellido_paterno': 'Torres',
                'apellido_materno': 'Vega',
                'cargo': 'Auxiliar de Bodega',
                'tipo_contrato': 'plazo_fijo',
                'sede': 'valparaiso_bif',
                'activo': True,
            },
            
            # VALPARAÍSO BIC - INDEFINIDO
            {
                'rut': '78901234-5',
                'nombre': 'Diego',
                'apellido_paterno': 'Muñoz',
                'apellido_materno': 'Castro',
                'cargo': 'Operario de Mantención',
                'tipo_contrato': 'indefinido',
                'sede': 'valparaiso_bic',
                'activo': True,
            },
            {
                'rut': '89012345-6',
                'nombre': 'Valentina',
                'apellido_paterno': 'Fernández',
                'apellido_materno': 'Soto',
                'cargo': 'Jefe de Producción',
                'tipo_contrato': 'indefinido',
                'sede': 'valparaiso_bic',
                'activo': True,
            },
            
            # VALPARAÍSO BIC - PLAZO FIJO
            {
                'rut': '90123456-7',
                'nombre': 'Rodrigo',
                'apellido_paterno': 'Vargas',
                'apellido_materno': 'Morales',
                'cargo': 'Ayudante de Producción',
                'tipo_contrato': 'plazo_fijo',
                'sede': 'valparaiso_bic',
                'activo': True,
            },
            
            # TRABAJADOR INACTIVO
            {
                'rut': '11223344-5',
                'nombre': 'Sofía',
                'apellido_paterno': 'Contreras',
                'apellido_materno': 'Ruiz',
                'cargo': 'Ex Operario',
                'tipo_contrato': 'indefinido',
                'sede': 'casablanca',
                'activo': False,
            },
            
            # MÁS TRABAJADORES PARA PRUEBAS
            {
                'rut': '15151515-1',
                'nombre': 'Francisco',
                'apellido_paterno': 'Sánchez',
                'apellido_materno': 'Díaz',
                'cargo': 'Operario de Calidad',
                'tipo_contrato': 'indefinido',
                'sede': 'casablanca',
                'activo': True,
            },
            {
                'rut': '16161616-2',
                'nombre': 'Camila',
                'apellido_paterno': 'Rojas',
                'apellido_materno': 'Pérez',
                'cargo': 'Supervisor de Turno',
                'tipo_contrato': 'plazo_fijo',
                'sede': 'valparaiso_bif',
                'activo': True,
            },
            {
                'rut': '17171717-3',
                'nombre': 'Sebastián',
                'apellido_paterno': 'Moreno',
                'apellido_materno': 'Vargas',
                'cargo': 'Operario de Línea',
                'tipo_contrato': 'indefinido',
                'sede': 'valparaiso_bic',
                'activo': True,
            },
        ]

        self.stdout.write("📝 Creando trabajadores...")
        for data in trabajadores_data:
            trabajador, created = Trabajador.objects.get_or_create(
                rut=data['rut'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f"  ✅ Creado: {trabajador.nombre} {trabajador.apellido_paterno} ({trabajador.rut}) - {trabajador.sede} - {trabajador.tipo_contrato}"
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f"  ⏭️  Ya existe: {trabajador.nombre} {trabajador.apellido_paterno} ({trabajador.rut})"
                ))

        # ============================================
        # CREAR CAJAS
        # ============================================

        cajas_data = [
            # CASABLANCA - INDEFINIDO
            {'codigo': 'CASA-IND-001', 'tipo_contrato': 'indefinido', 'sucursal': 'casablanca', 'cantidad_disponible': 50},
            {'codigo': 'CASA-IND-002', 'tipo_contrato': 'indefinido', 'sucursal': 'casablanca', 'cantidad_disponible': 45},
            {'codigo': 'CASA-IND-003', 'tipo_contrato': 'indefinido', 'sucursal': 'casablanca', 'cantidad_disponible': 60},
            {'codigo': 'CASA-IND-004', 'tipo_contrato': 'indefinido', 'sucursal': 'casablanca', 'cantidad_disponible': 38},
            
            # CASABLANCA - PLAZO FIJO
            {'codigo': 'CASA-PLZ-001', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'casablanca', 'cantidad_disponible': 30},
            {'codigo': 'CASA-PLZ-002', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'casablanca', 'cantidad_disponible': 25},
            {'codigo': 'CASA-PLZ-003', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'casablanca', 'cantidad_disponible': 22},
            
            # VALPARAÍSO BIF - INDEFINIDO
            {'codigo': 'VBIF-IND-001', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 40},
            {'codigo': 'VBIF-IND-002', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 55},
            {'codigo': 'VBIF-IND-003', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 48},
            {'codigo': 'VBIF-IND-004', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 42},
            
            # VALPARAÍSO BIF - PLAZO FIJO
            {'codigo': 'VBIF-PLZ-001', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 35},
            {'codigo': 'VBIF-PLZ-002', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 28},
            {'codigo': 'VBIF-PLZ-003', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 31},
            
            # VALPARAÍSO BIC - INDEFINIDO
            {'codigo': 'VBIC-IND-001', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 52},
            {'codigo': 'VBIC-IND-002', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 47},
            {'codigo': 'VBIC-IND-003', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 58},
            {'codigo': 'VBIC-IND-004', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 44},
            
            # VALPARAÍSO BIC - PLAZO FIJO
            {'codigo': 'VBIC-PLZ-001', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 32},
            {'codigo': 'VBIC-PLZ-002', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 27},
            {'codigo': 'VBIC-PLZ-003', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 29},
            
            # CAJAS CON POCO STOCK (PARA ALERTAS)
            {'codigo': 'CASA-IND-LOW', 'tipo_contrato': 'indefinido', 'sucursal': 'casablanca', 'cantidad_disponible': 3},
            {'codigo': 'VBIF-PLZ-LOW', 'tipo_contrato': 'plazo_fijo', 'sucursal': 'valparaiso_bif', 'cantidad_disponible': 2},
            {'codigo': 'VBIC-IND-LOW', 'tipo_contrato': 'indefinido', 'sucursal': 'valparaiso_bic', 'cantidad_disponible': 1},
        ]

        self.stdout.write("\n📦 Creando cajas...")
        for data in cajas_data:
            caja, created = Caja.objects.get_or_create(
                codigo=data['codigo'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f"  ✅ Creada: {caja.codigo} - {caja.sucursal} - {caja.tipo_contrato} - Stock: {caja.cantidad_disponible}"
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f"  ⏭️  Ya existe: {caja.codigo}"
                ))

        # ============================================
        # RESUMEN
        # ============================================

        self.stdout.write("\n" + "="*60)
        self.stdout.write("RESUMEN DE DATOS CREADOS")
        self.stdout.write("="*60)

        self.stdout.write(f"\n📊 TRABAJADORES POR SEDE:")
        self.stdout.write(f"  • Casablanca: {Trabajador.objects.filter(sede='casablanca', activo=True).count()} activos")
        self.stdout.write(f"  • Valparaíso BIF: {Trabajador.objects.filter(sede='valparaiso_bif', activo=True).count()} activos")
        self.stdout.write(f"  • Valparaíso BIC: {Trabajador.objects.filter(sede='valparaiso_bic', activo=True).count()} activos")

        self.stdout.write(f"\n📊 TRABAJADORES POR TIPO DE CONTRATO:")
        self.stdout.write(f"  • Indefinido: {Trabajador.objects.filter(tipo_contrato='indefinido', activo=True).count()}")
        self.stdout.write(f"  • Plazo Fijo: {Trabajador.objects.filter(tipo_contrato='plazo_fijo', activo=True).count()}")

        self.stdout.write(f"\n📊 CAJAS POR SEDE:")
        self.stdout.write(f"  • Casablanca: {Caja.objects.filter(sucursal='casablanca').count()} cajas")
        self.stdout.write(f"  • Valparaíso BIF: {Caja.objects.filter(sucursal='valparaiso_bif').count()} cajas")
        self.stdout.write(f"  • Valparaíso BIC: {Caja.objects.filter(sucursal='valparaiso_bic').count()} cajas")

        self.stdout.write(f"\n📊 CAJAS POR TIPO:")
        self.stdout.write(f"  • Indefinido: {Caja.objects.filter(tipo_contrato='indefinido').count()}")
        self.stdout.write(f"  • Plazo Fijo: {Caja.objects.filter(tipo_contrato='plazo_fijo').count()}")

        total_stock = sum(c.cantidad_disponible for c in Caja.objects.all())
        self.stdout.write(f"\n📊 STOCK TOTAL: {total_stock} cajas disponibles")

        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✅ DATOS CREADOS EXITOSAMENTE"))
        self.stdout.write("="*60 + "\n")
        
        # Mostrar ejemplos de combinaciones válidas
        self.stdout.write("\n📋 EJEMPLOS DE COMBINACIONES VÁLIDAS PARA PRUEBAS:")
        self.stdout.write("\n✅ ENTREGAS CORRECTAS (mismo sede y tipo):")
        self.stdout.write("  • María Silva (23456789-0) → CASA-IND-001")
        self.stdout.write("  • Pedro Martínez (34567890-1) → CASA-PLZ-001")
        self.stdout.write("  • Ana Ramírez (45678901-2) → VBIF-IND-001")
        self.stdout.write("  • Laura Torres (67890123-4) → VBIF-PLZ-001")
        self.stdout.write("  • Diego Muñoz (78901234-5) → VBIC-IND-001")
        self.stdout.write("  • Rodrigo Vargas (90123456-7) → VBIC-PLZ-001")
        
        self.stdout.write("\n⚠️  ENTREGAS CON ADVERTENCIA (mismo sede, distinto tipo):")
        self.stdout.write("  • María Silva (23456789-0, Indefinido) → CASA-PLZ-001 (Plazo Fijo)")
        
        self.stdout.write("\n❌ ENTREGAS INCORRECTAS (distinta sede):")
        self.stdout.write("  • María Silva (Casablanca) → VBIF-IND-001 (Valparaíso BIF)")
        self.stdout.write("\n")