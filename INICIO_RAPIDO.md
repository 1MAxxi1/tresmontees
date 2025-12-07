# ⚡ INICIO RÁPIDO - 5 MINUTOS

## 🚀 Opción 1: Instalación Automática (Recomendado)

```bash
# 1. Extraer el proyecto
unzip tresmontees-mejorado.zip
cd tresmontees-mejorado

# 2. Ejecutar instalador
bash instalar.sh

# 3. Iniciar servidor
cd backend
python manage.py runserver
```

✅ **¡Listo!** Servidor corriendo en http://localhost:8000

---

## 🔧 Opción 2: Instalación Manual

```bash
# 1. Extraer proyecto
unzip tresmontees-mejorado.zip
cd tresmontees-mejorado

# 2. Instalar dependencias
cd backend
pip install -r ../requirements.txt

# 3. Aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# 4. Poblar datos de prueba
python populate_test_data.py

# 5. Iniciar servidor
python manage.py runserver
```

---

## 🧪 PRIMERA PRUEBA

### 1. Login con Postman o cURL

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"guardia01","password":"password123"}'
```

**Respuesta esperada:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": {
    "id": 1,
    "username": "guardia01",
    "rol": "guardia"
  }
}
```

### 2. Validar Trabajador

Copia el token `access` y úsalo en el siguiente comando:

```bash
curl -X POST http://localhost:8000/api/entregas/validar_trabajador/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"rut":"12345678-9"}'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "rut": "12345678-9",
  "nombre": "Juan",
  "apellido": "Pérez",
  "tipo_contrato": "indefinido",
  "sucursal": "casablanca"
}
```

### 3. Crear Entrega Completa

```bash
curl -X POST http://localhost:8000/api/entregas/crear_entrega_completa/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"trabajador_rut":"12345678-9","caja_codigo":"CAJA-CASA-IND-001"}'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "trabajador": 1,
  "caja": 1,
  "fecha_entrega": "2024-11-29T...",
  "estado": "entregado"
}
```

✅ **¡Funciona!** El stock de la caja se habrá reducido automáticamente de 150 a 149.

---

## 🔑 CREDENCIALES

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Guardia | guardia01 | password123 |
| Guardia | guardia02 | password123 |
| Supervisor | supervisor01 | password123 |
| RRHH | rrhh01 | password123 |

---

## 📊 DATOS DE PRUEBA

### Trabajadores Disponibles:
- **12345678-9** - Juan Pérez (Casablanca, Indefinido)
- **23456789-0** - María López (Casablanca, Indefinido)
- **34567890-1** - Carlos Rodríguez (Casablanca, Plazo)
- **45678901-2** - Laura Fernández (Casablanca, Plazo)
- ... y 6 más en otras sucursales

### Cajas Disponibles:
- **CAJA-CASA-IND-001** (Casablanca, Indefinido, Stock: 150)
- **CAJA-CASA-IND-002** (Casablanca, Indefinido, Stock: 200)
- **CAJA-CASA-PLAZO-001** (Casablanca, Plazo Fijo, Stock: 100)
- ... y 7 más

---

## 🎯 CASOS DE PRUEBA

### ✅ Caso Compatible
```bash
# Trabajador indefinido + Caja indefinida + Misma sucursal
trabajador_rut: "12345678-9"  # Juan Pérez (Casablanca, Indefinido)
caja_codigo: "CAJA-CASA-IND-001"  # (Casablanca, Indefinido)
# ✅ FUNCIONA
```

### ❌ Caso Incompatible - Tipo Contrato
```bash
# Trabajador indefinido + Caja plazo fijo
trabajador_rut: "12345678-9"  # Juan Pérez (Indefinido)
caja_codigo: "CAJA-CASA-PLAZO-001"  # (Plazo Fijo)
# ❌ ERROR: "Incompatibilidad de tipo de contrato"
```

### ❌ Caso Incompatible - Sucursal
```bash
# Trabajador Casablanca + Caja Valparaíso
trabajador_rut: "12345678-9"  # Juan Pérez (Casablanca)
caja_codigo: "CAJA-BIF-IND-001"  # (Valparaíso BIF)
# ❌ ERROR: "Incompatibilidad de sucursal"
```

---

## 📚 SIGUIENTE PASO

Lee la documentación completa en:
- `README.md` - Guía completa del proyecto
- `docs/API_DOCUMENTATION.md` - Documentación de API
- `docs/PLAN_MEJORAS.md` - Plan detallado de mejoras

---

## 🐛 ¿Problemas?

### Error: "No module named 'django_filters'"
```bash
pip install django-filter
```

### Error: "No module named 'PIL'"
```bash
pip install Pillow
```

### El servidor no inicia
```bash
# Verifica que estés en la carpeta correcta
cd backend
python manage.py runserver
```

---

**¡Listo para empezar! 🚀**
