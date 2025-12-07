# 🎁 PROYECTO TRES MONTEES - VERSIÓN MEJORADA

## 📦 ¿Qué incluye este proyecto?

Este es tu proyecto original con **TODAS las mejoras aplicadas**:

✅ Backend Django completamente funcional con mejoras  
✅ Modelo de Entregas mejorado con validaciones  
✅ Sistema de Incidencias avanzado  
✅ 10+ endpoints nuevos para el flujo del guardia  
✅ Script de datos de prueba incluido  
✅ Documentación completa  

---

## 🚀 INSTALACIÓN RÁPIDA

### Paso 1: Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

**Dependencias adicionales necesarias:**
```bash
pip install django-filter Pillow
```

### Paso 2: Configurar base de datos

```bash
# Eliminar la base de datos anterior (si existe)
rm db.sqlite3

# Crear nuevas migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate
```

### Paso 3: Poblar con datos de prueba

```bash
python populate_test_data.py
```

Esto creará:
- 4 usuarios (2 guardias, 1 supervisor, 1 RRHH)
- 10 trabajadores de prueba
- 10 cajas de diferentes tipos

### Paso 4: Iniciar el servidor

```bash
python manage.py runserver
```

El servidor estará disponible en: `http://localhost:8000`

---

## 🔑 CREDENCIALES DE PRUEBA

Una vez que ejecutes `populate_test_data.py`, usa estas credenciales:

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Guardia | guardia01 | password123 |
| Guardia | guardia02 | password123 |
| Supervisor | supervisor01 | password123 |
| RRHH | rrhh01 | password123 |

---

## 🧪 PROBAR EL SISTEMA

### 1. Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"guardia01","password":"password123"}'
```

Guarda el token `access` que te devuelve.

### 2. Validar Trabajador

```bash
curl -X POST http://localhost:8000/api/entregas/validar_trabajador/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"rut":"12345678-9"}'
```

### 3. Validar Caja

```bash
curl -X POST http://localhost:8000/api/entregas/validar_caja/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"codigo":"CAJA-CASA-IND-001","sucursal":"casablanca"}'
```

### 4. Crear Entrega

```bash
curl -X POST http://localhost:8000/api/entregas/crear_entrega_completa/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"trabajador_rut":"12345678-9","caja_codigo":"CAJA-CASA-IND-001"}'
```

---

## 📊 DATOS DE PRUEBA INCLUIDOS

### Trabajador Compatible:
- **RUT:** 12345678-9
- **Nombre:** Juan Pérez
- **Tipo Contrato:** Indefinido
- **Sucursal:** Casablanca

### Caja Compatible:
- **Código:** CAJA-CASA-IND-001
- **Tipo:** Indefinido
- **Sucursal:** Casablanca
- **Stock:** 150 unidades

Estos dos son **compatibles** y puedes usarlos para probar el flujo completo.

---

## 📚 DOCUMENTACIÓN ADICIONAL

En la carpeta `docs/` encontrarás:
- `API_DOCUMENTATION.md` - Documentación completa de endpoints
- `PLAN_MEJORAS.md` - Plan detallado de mejoras
- `GUIA_FRONTEND.md` - Guía para implementar el frontend

---

## 🆕 NUEVAS FUNCIONALIDADES

### Endpoints del Guardia:
- ✅ `POST /api/entregas/validar_trabajador/` - Valida RUT o QR
- ✅ `POST /api/entregas/validar_caja/` - Valida código o QR de caja
- ✅ `POST /api/entregas/crear_entrega_completa/` - Crea entrega completa
- ✅ `GET /api/entregas/mis_entregas_hoy/` - Entregas del día actual
- ✅ `GET /api/entregas/estadisticas_guardia/` - Estadísticas personales

### Validaciones Automáticas:
- ✅ Compatibilidad de sucursal (trabajador vs caja)
- ✅ Compatibilidad de tipo de contrato
- ✅ Verificación de stock disponible
- ✅ Descuento automático de inventario
- ✅ Validación de trabajador activo

### Sistema de Incidencias:
- ✅ Más tipos de incidencias
- ✅ Prioridades automáticas
- ✅ Cálculo de SLA
- ✅ Soporte para evidencias fotográficas

---

## 🛠 ESTRUCTURA DEL PROYECTO

```
tresmontees-mejorado/
├── backend/
│   ├── cajas/               # App de cajas
│   ├── config/              # Configuración Django
│   ├── entregas/            # App de entregas (MEJORADA ✨)
│   ├── incidencias/         # App de incidencias (MEJORADA ✨)
│   ├── trabajadores/        # App de trabajadores
│   ├── usuarios/            # App de usuarios
│   ├── db.sqlite3          # Base de datos
│   ├── manage.py
│   └── populate_test_data.py  # Script de datos de prueba
├── frontend/                # (Vacío - por implementar)
├── docs/                    # Documentación
├── requirements.txt
└── README.md               # Este archivo
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error: "No module named 'django_filters'"
```bash
pip install django-filter
```

### Error: "No module named 'PIL'"
```bash
pip install Pillow
```

### Error de CORS al conectar frontend
Edita `backend/config/settings.py`:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### La migración falla
```bash
# Opción 1: Borrar base de datos y empezar de cero
rm backend/db.sqlite3
python manage.py migrate

# Opción 2: Ver qué migración falla
python manage.py migrate --verbosity 3
```

---

## 📱 PRÓXIMO PASO: FRONTEND

Para implementar el frontend:

1. Ve a la carpeta `docs/ejemplo_componente_react.jsx`
2. Sigue la guía en `docs/GUIA_FRONTEND.md`
3. Inicializa React con Vite
4. Usa el componente de ejemplo proporcionado

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa los logs del servidor Django
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de haber ejecutado las migraciones
4. Ejecuta el script de datos de prueba

---

## 🎯 CHECKLIST DE VERIFICACIÓN

Después de instalar, verifica:

- [ ] ✅ Servidor corre sin errores
- [ ] ✅ Login funciona con guardia01/password123
- [ ] ✅ Endpoint validar_trabajador funciona
- [ ] ✅ Endpoint validar_caja funciona
- [ ] ✅ Crear entrega descuenta stock automáticamente
- [ ] ✅ Hay 10 trabajadores en la base de datos
- [ ] ✅ Hay 10 cajas en la base de datos

---

## 📄 LICENCIA

Este proyecto es propiedad de Tres Montees.

---

**¡Listo para usar! 🚀**

Cualquier duda, revisa la documentación en la carpeta `docs/`.
