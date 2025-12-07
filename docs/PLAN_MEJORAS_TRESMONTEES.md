# 🚀 PLAN DE MEJORAS - PROYECTO TRES MONTEES

## 📋 RESUMEN EJECUTIVO

Sistema de gestión de entrega de beneficios (cajas) para trabajadores de Tres Montees.

**Stack Actual:**
- Backend: Django 5.2.8 + DRF
- Frontend: **PENDIENTE** (React recomendado)
- Base de datos: SQLite (desarrollo) / MySQL (producción)
- Autenticación: JWT

**Usuarios del Sistema:**
1. **Guardia** - Escanea QR, entrega cajas, registra incidencias
2. **Supervisor** - Revisa incidencias, autoriza entregas especiales
3. **RRHH** - Administra trabajadores, genera reportes, gestiona inventario

---

## ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Modelo de Entregas Incompleto**
**Problema:** No registra qué caja específica se entregó
**Impacto:** No puedes hacer tracking de inventario por caja individual
**Solución:** Agregar ForeignKey a Caja

### 2. **Falta Control de Inventario**
**Problema:** No hay validación de stock antes de entregar
**Impacto:** Podrías entregar cajas que no existen
**Solución:** Implementar validación en el serializer y descontar inventario

### 3. **Validación de Compatibilidad Caja-Trabajador**
**Problema:** No validas que el tipo de contrato del trabajador coincida con la caja
**Impacto:** Entregas incorrectas
**Solución:** Validación en backend antes de confirmar entrega

### 4. **Frontend Inexistente**
**Problema:** No hay interfaz de usuario
**Solución:** Implementar React con TypeScript

### 5. **Registro de Incidencias Básico**
**Problema:** Modelo existe pero falta interfaz y funcionalidades avanzadas
**Solución:** Mejorar UX y agregar notificaciones

---

## 🔧 MEJORAS AL BACKEND

### **1.1 Migración para Modelo de Entregas Mejorado**

```python
# backend/entregas/models.py
from django.db import models
from trabajadores.models import Trabajador
from cajas.models import Caja
from usuarios.models import Usuario
from django.core.exceptions import ValidationError

class Entrega(models.Model):
    ESTADO_CHOICES = [
        ('entregado', 'Entregado'),
        ('no_entregado', 'No Entregado'),
        ('pendiente', 'Pendiente'),
    ]
    
    trabajador = models.ForeignKey(
        Trabajador, 
        on_delete=models.CASCADE, 
        verbose_name='Trabajador'
    )
    caja = models.ForeignKey(
        Caja,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Caja Entregada'
    )
    guardia = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name='Guardia', 
        limit_choices_to={'rol': 'guardia'}
    )
    fecha_entrega = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de Entrega'
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='entregado', 
        verbose_name='Estado'
    )
    observaciones = models.TextField(
        blank=True, 
        verbose_name='Observaciones'
    )
    codigo_qr_trabajador = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name='Código QR Trabajador'
    )
    codigo_qr_caja = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name='Código QR Caja'
    )
    
    # Campos de auditoría
    validado_supervisor = models.BooleanField(
        default=False,
        verbose_name='Validado por Supervisor'
    )
    supervisor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entregas_validadas',
        verbose_name='Supervisor',
        limit_choices_to={'rol': 'supervisor'}
    )
    fecha_validacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Validación'
    )
    
    class Meta:
        verbose_name = 'Entrega'
        verbose_name_plural = 'Entregas'
        ordering = ['-fecha_entrega']
        indexes = [
            models.Index(fields=['-fecha_entrega']),
            models.Index(fields=['trabajador', '-fecha_entrega']),
        ]
    
    def clean(self):
        """Validación de compatibilidad trabajador-caja"""
        if self.trabajador and self.caja:
            # Validar sucursal
            if self.trabajador.sucursal != self.caja.sucursal:
                raise ValidationError({
                    'caja': f'La caja es de {self.caja.get_sucursal_display()}, '
                           f'pero el trabajador es de {self.trabajador.get_sucursal_display()}'
                })
            
            # Validar tipo de contrato
            tipo_trabajador = self.trabajador.tipo_contrato
            tipo_caja = self.caja.tipo_contrato
            
            # Mapeo de tipos
            if tipo_trabajador == 'plazo' and tipo_caja != 'plazo_fijo':
                raise ValidationError({
                    'caja': 'El trabajador tiene contrato a plazo pero la caja es para indefinidos'
                })
            elif tipo_trabajador == 'indefinido' and tipo_caja != 'indefinido':
                raise ValidationError({
                    'caja': 'El trabajador tiene contrato indefinido pero la caja es para plazo fijo'
                })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Entrega a {self.trabajador.nombre_completo()} - {self.fecha_entrega.strftime('%d/%m/%Y %H:%M')}"
```

### **1.2 Serializer Mejorado con Validaciones**

```python
# backend/entregas/serializers.py
from rest_framework import serializers
from django.db import transaction
from .models import Entrega
from trabajadores.serializers import TrabajadorSerializer
from cajas.serializers import CajaSerializer
from usuarios.serializers import UsuarioSerializer
from cajas.models import Caja

class EntregaSerializer(serializers.ModelSerializer):
    trabajador_detalle = TrabajadorSerializer(source='trabajador', read_only=True)
    caja_detalle = CajaSerializer(source='caja', read_only=True)
    guardia_detalle = UsuarioSerializer(source='guardia', read_only=True)
    
    class Meta:
        model = Entrega
        fields = '__all__'
        read_only_fields = ('fecha_entrega', 'validado_supervisor', 'fecha_validacion')
    
    def validate(self, data):
        """Validación completa antes de crear entrega"""
        trabajador = data.get('trabajador')
        caja = data.get('caja')
        
        if not caja:
            raise serializers.ValidationError({
                'caja': 'Debe especificar una caja'
            })
        
        # Validar stock disponible
        if caja.cantidad_disponible <= 0:
            raise serializers.ValidationError({
                'caja': f'No hay stock disponible de esta caja en {caja.get_sucursal_display()}'
            })
        
        # Validar que la caja esté activa
        if not caja.activa:
            raise serializers.ValidationError({
                'caja': 'Esta caja está inactiva'
            })
        
        # Validar que el trabajador esté activo
        if trabajador and not trabajador.is_active:
            raise serializers.ValidationError({
                'trabajador': 'El trabajador no está activo'
            })
        
        # Validar compatibilidad (se hace en el modelo también)
        if trabajador.sucursal != caja.sucursal:
            raise serializers.ValidationError({
                'caja': f'Incompatibilidad de sucursal: Trabajador en {trabajador.get_sucursal_display()}, '
                       f'Caja en {caja.get_sucursal_display()}'
            })
        
        # Validar tipo de contrato
        tipo_trabajador = trabajador.tipo_contrato
        tipo_caja = caja.tipo_contrato
        
        if tipo_trabajador == 'plazo' and tipo_caja != 'plazo_fijo':
            raise serializers.ValidationError({
                'caja': 'El tipo de contrato no coincide: trabajador a plazo, caja para indefinidos'
            })
        elif tipo_trabajador == 'indefinido' and tipo_caja != 'indefinido':
            raise serializers.ValidationError({
                'caja': 'El tipo de contrato no coincide: trabajador indefinido, caja para plazo fijo'
            })
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear entrega y descontar inventario"""
        caja = validated_data.get('caja')
        
        # Crear la entrega
        entrega = Entrega.objects.create(**validated_data)
        
        # Descontar del inventario
        caja.cantidad_disponible -= 1
        caja.save(update_fields=['cantidad_disponible'])
        
        return entrega


class EntregaListSerializer(serializers.ModelSerializer):
    """Serializer optimizado para listados"""
    trabajador_nombre = serializers.CharField(source='trabajador.nombre_completo', read_only=True)
    guardia_nombre = serializers.CharField(source='guardia.get_full_name', read_only=True)
    caja_codigo = serializers.CharField(source='caja.codigo', read_only=True)
    
    class Meta:
        model = Entrega
        fields = [
            'id', 'trabajador_nombre', 'guardia_nombre', 'caja_codigo',
            'fecha_entrega', 'estado', 'validado_supervisor'
        ]
```

### **1.3 Vistas Mejoradas con Endpoints Adicionales**

```python
# backend/entregas/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import Entrega
from .serializers import EntregaSerializer, EntregaListSerializer
from trabajadores.models import Trabajador
from cajas.models import Caja

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.select_related(
        'trabajador', 'caja', 'guardia', 'supervisor'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estado', 'guardia', 'trabajador', 'validado_supervisor']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EntregaListSerializer
        return EntregaSerializer
    
    def perform_create(self, serializer):
        """Asignar automáticamente el guardia actual"""
        serializer.save(guardia=self.request.user)
    
    @action(detail=False, methods=['get'])
    def mis_entregas_hoy(self, request):
        """Obtener entregas del guardia actual del día de hoy"""
        hoy = timezone.now().date()
        entregas = self.queryset.filter(
            guardia=request.user,
            fecha_entrega__date=hoy
        )
        serializer = self.get_serializer(entregas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estadisticas_guardia(self, request):
        """Estadísticas del guardia actual"""
        hoy = timezone.now().date()
        semana_pasada = hoy - timedelta(days=7)
        
        stats = {
            'entregas_hoy': self.queryset.filter(
                guardia=request.user,
                fecha_entrega__date=hoy
            ).count(),
            'entregas_semana': self.queryset.filter(
                guardia=request.user,
                fecha_entrega__date__gte=semana_pasada
            ).count(),
            'entregas_mes': self.queryset.filter(
                guardia=request.user,
                fecha_entrega__month=hoy.month,
                fecha_entrega__year=hoy.year
            ).count(),
        }
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def validar_trabajador(self, request):
        """Validar trabajador por RUT o QR"""
        rut = request.data.get('rut')
        qr_code = request.data.get('qr_code')
        
        try:
            if qr_code:
                trabajador = Trabajador.objects.get(rut=qr_code, is_active=True)
            elif rut:
                trabajador = Trabajador.objects.get(rut=rut, is_active=True)
            else:
                return Response(
                    {'error': 'Debe proporcionar RUT o código QR'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from trabajadores.serializers import TrabajadorSerializer
            return Response(TrabajadorSerializer(trabajador).data)
            
        except Trabajador.DoesNotExist:
            return Response(
                {'error': 'Trabajador no encontrado o inactivo'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def validar_caja(self, request):
        """Validar caja por código o QR"""
        codigo = request.data.get('codigo')
        qr_code = request.data.get('qr_code')
        sucursal = request.data.get('sucursal')
        
        try:
            if qr_code:
                caja = Caja.objects.get(codigo=qr_code, activa=True)
            elif codigo:
                caja = Caja.objects.get(codigo=codigo, activa=True)
            else:
                return Response(
                    {'error': 'Debe proporcionar código o QR de la caja'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Filtrar por sucursal si se proporciona
            if sucursal and caja.sucursal != sucursal:
                return Response(
                    {
                        'error': 'La caja no pertenece a la sucursal del trabajador',
                        'caja_sucursal': caja.get_sucursal_display(),
                        'trabajador_sucursal': sucursal
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from cajas.serializers import CajaSerializer
            return Response(CajaSerializer(caja).data)
            
        except Caja.DoesNotExist:
            return Response(
                {'error': 'Caja no encontrada o inactiva'},
                status=status.HTTP_404_NOT_FOUND
            )
```

---

## 🎨 IMPLEMENTACIÓN DEL FRONTEND

### **2.1 Estructura Recomendada**

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── axiosConfig.js
│   │   ├── authApi.js
│   │   ├── trabajadoresApi.js
│   │   ├── cajasApi.js
│   │   ├── entregasApi.js
│   │   └── incidenciasApi.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── guardia/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScanQR.jsx
│   │   │   ├── DetalleTrabajador.jsx
│   │   │   ├── DetalleCaja.jsx
│   │   │   ├── ConfirmarEntrega.jsx
│   │   │   └── RegistrarIncidencia.jsx
│   │   ├── supervisor/
│   │   │   ├── Dashboard.jsx
│   │   │   └── ListaIncidencias.jsx
│   │   └── rrhh/
│   │       ├── Dashboard.jsx
│   │       ├── GestionTrabajadores.jsx
│   │       └── Reportes.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useQRScanner.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── GuardiaDashboard.jsx
│   │   ├── SupervisorDashboard.jsx
│   │   └── RRHHDashboard.jsx
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### **2.2 Tecnologías Frontend Recomendadas**

```json
{
  "name": "tresmontees-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.12.0",
    "@zxing/library": "^0.20.0",
    "react-qr-scanner": "^1.0.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 📱 FUNCIONALIDAD REGISTRO DE INCIDENCIAS MEJORADA

### **3.1 Mejoras al Modelo**

El modelo actual está bien, pero podemos agregar:

```python
# backend/incidencias/models.py
from django.db import models
from trabajadores.models import Trabajador
from usuarios.models import Usuario
from entregas.models import Entrega

class Incidencia(models.Model):
    TIPO_CHOICES = [
        ('qr_no_funciona', 'QR no funciona'),
        ('trabajador_no_registrado', 'Trabajador no registrado'),
        ('caja_danada', 'Caja dañada'),
        ('stock_insuficiente', 'Stock insuficiente'),
        ('trabajador_sin_beneficio', 'Trabajador sin derecho a beneficio'),
        ('otro', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('resuelto', 'Resuelto'),
        ('rechazado', 'Rechazado'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]
    
    trabajador = models.ForeignKey(
        Trabajador, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name='Trabajador'
    )
    guardia = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='incidencias_reportadas', 
        verbose_name='Guardia que reporta', 
        limit_choices_to={'rol': 'guardia'}
    )
    supervisor = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='incidencias_resueltas', 
        verbose_name='Supervisor que resuelve', 
        limit_choices_to={'rol': 'supervisor'}
    )
    entrega_relacionada = models.ForeignKey(
        Entrega,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Entrega Relacionada'
    )
    tipo = models.CharField(
        max_length=30, 
        choices=TIPO_CHOICES, 
        verbose_name='Tipo de Incidencia'
    )
    descripcion = models.TextField(verbose_name='Descripción')
    prioridad = models.CharField(
        max_length=10,
        choices=PRIORIDAD_CHOICES,
        default='media',
        verbose_name='Prioridad'
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='pendiente', 
        verbose_name='Estado'
    )
    fecha_reporte = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de Reporte'
    )
    fecha_resolucion = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='Fecha de Resolución'
    )
    solucion = models.TextField(
        blank=True, 
        verbose_name='Solución'
    )
    
    # Campos adicionales
    rut_trabajador_manual = models.CharField(
        max_length=12,
        blank=True,
        verbose_name='RUT ingresado manualmente'
    )
    imagen_evidencia = models.ImageField(
        upload_to='incidencias/',
        null=True,
        blank=True,
        verbose_name='Imagen de Evidencia'
    )
    
    class Meta:
        verbose_name = 'Incidencia'
        verbose_name_plural = 'Incidencias'
        ordering = ['-fecha_reporte']
        indexes = [
            models.Index(fields=['-fecha_reporte']),
            models.Index(fields=['estado', '-fecha_reporte']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.estado} - {self.fecha_reporte.strftime('%d/%m/%Y')}"
    
    def asignar_prioridad_automatica(self):
        """Asignar prioridad según tipo de incidencia"""
        prioridades_altas = ['stock_insuficiente', 'trabajador_sin_beneficio']
        if self.tipo in prioridades_altas:
            self.prioridad = 'alta'
        else:
            self.prioridad = 'media'
```

---

## 🔄 ENDPOINTS NECESARIOS

### **Endpoints Backend Completos:**

```
# Autenticación
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/refresh/
GET  /api/auth/me/

# Trabajadores
GET    /api/trabajadores/
POST   /api/trabajadores/
GET    /api/trabajadores/{id}/
PUT    /api/trabajadores/{id}/
DELETE /api/trabajadores/{id}/
POST   /api/trabajadores/buscar-por-rut/

# Cajas
GET    /api/cajas/
POST   /api/cajas/
GET    /api/cajas/{id}/
PUT    /api/cajas/{id}/
GET    /api/cajas/disponibles-por-sucursal/

# Entregas
GET    /api/entregas/
POST   /api/entregas/
GET    /api/entregas/{id}/
GET    /api/entregas/mis-entregas-hoy/
GET    /api/entregas/estadisticas-guardia/
POST   /api/entregas/validar-trabajador/
POST   /api/entregas/validar-caja/

# Incidencias
GET    /api/incidencias/
POST   /api/incidencias/
GET    /api/incidencias/{id}/
PUT    /api/incidencias/{id}/
PATCH  /api/incidencias/{id}/resolver/
GET    /api/incidencias/pendientes/
GET    /api/incidencias/mis-incidencias/
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Backend (1-2 días)**
- [ ] Crear migración para modelo Entrega mejorado
- [ ] Actualizar serializers con validaciones
- [ ] Implementar vistas con endpoints adicionales
- [ ] Mejorar modelo de Incidencias
- [ ] Agregar tests unitarios
- [ ] Documentar API con Swagger/OpenAPI

### **Fase 2: Frontend Base (2-3 días)**
- [ ] Configurar Vite + React + Tailwind
- [ ] Implementar autenticación (login/logout)
- [ ] Crear contexto de autenticación
- [ ] Configurar rutas protegidas
- [ ] Implementar componentes comunes (Navbar, Loader, etc.)

### **Fase 3: Módulo Guardia (3-4 días)**
- [ ] Dashboard con estadísticas
- [ ] Scanner QR para trabajadores
- [ ] Detalle de trabajador
- [ ] Scanner QR para cajas
- [ ] Detalle de caja
- [ ] Confirmación de entrega
- [ ] Formulario de incidencias
- [ ] Lista de mis entregas del día

### **Fase 4: Módulo Supervisor (2 días)**
- [ ] Dashboard supervisor
- [ ] Lista de incidencias pendientes
- [ ] Detalle de incidencia
- [ ] Resolución de incidencias
- [ ] Estadísticas de incidencias

### **Fase 5: Módulo RRHH (3 días)**
- [ ] Dashboard RRHH
- [ ] CRUD de trabajadores
- [ ] Gestión de cajas e inventario
- [ ] Reportes y estadísticas
- [ ] Exportación de datos

### **Fase 6: Testing y Deploy (2 días)**
- [ ] Tests E2E con Cypress
- [ ] Optimización de rendimiento
- [ ] Configuración de producción
- [ ] Deploy backend (Railway/Render/AWS)
- [ ] Deploy frontend (Vercel/Netlify)

---

## 📊 MEJORAS ADICIONALES RECOMENDADAS

1. **Notificaciones en Tiempo Real**
   - WebSockets para notificar supervisores de nuevas incidencias
   - Alertas de stock bajo

2. **Sistema de Auditoría**
   - Log de todas las acciones críticas
   - Trazabilidad completa

3. **Reportes Avanzados**
   - Dashboard con gráficos (Chart.js / Recharts)
   - Exportación a Excel/PDF

4. **Optimizaciones**
   - Cache con Redis
   - Paginación en listados
   - Lazy loading de imágenes

5. **Seguridad**
   - Rate limiting
   - Validación de permisos por rol
   - Sanitización de inputs

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Ejecutar migraciones mejoradas**
2. **Actualizar código del backend según este documento**
3. **Inicializar proyecto React**
4. **Implementar flujo completo del guardia**
5. **Testing exhaustivo**

¿Quieres que empiece a generar el código completo para alguna de estas fases?
