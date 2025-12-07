# 📡 DOCUMENTACIÓN DE API - TRES MONTEES

## 🔐 AUTENTICACIÓN

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "guardia01",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "guardia01",
    "rol": "guardia",
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Obtener Usuario Actual
```http
GET /api/auth/me/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 👷 TRABAJADORES

### Listar Trabajadores
```http
GET /api/trabajadores/
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "rut": "12345678-9",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@empresa.cl",
    "telefono": "+56912345678",
    "tipo_contrato": "indefinido",
    "sucursal": "casablanca",
    "area": "Producción",
    "is_active": true,
    "fecha_ingreso": "2024-01-15"
  }
]
```

### Buscar por RUT
```http
POST /api/trabajadores/buscar-por-rut/
Authorization: Bearer {token}
Content-Type: application/json

{
  "rut": "12345678-9"
}
```

---

## 📦 CAJAS

### Listar Cajas Disponibles
```http
GET /api/cajas/?activa=true&cantidad_disponible__gt=0
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "codigo": "CAJA-IND-001",
    "tipo_contrato": "indefinido",
    "sucursal": "casablanca",
    "cantidad_disponible": 150,
    "fecha_creacion": "2024-01-10T10:00:00Z",
    "activa": true
  }
]
```

### Cajas Disponibles por Sucursal
```http
GET /api/cajas/disponibles-por-sucursal/?sucursal=casablanca
Authorization: Bearer {token}
```

---

## 🎁 ENTREGAS

### 1. Flujo Completo del Guardia

#### Paso 1: Validar Trabajador (Escanear QR o ingresar RUT)
```http
POST /api/entregas/validar_trabajador/
Authorization: Bearer {token}
Content-Type: application/json

{
  "rut": "12345678-9"
}
```
O con QR:
```json
{
  "qr_code": "12345678-9"
}
```

**Respuesta exitosa:**
```json
{
  "id": 1,
  "rut": "12345678-9",
  "nombre": "Juan",
  "apellido": "Pérez",
  "tipo_contrato": "indefinido",
  "sucursal": "casablanca",
  "ultima_entrega": {
    "fecha": "2024-01-10T14:30:00Z",
    "guardia": "Pedro González",
    "estado": "Entregado"
  }
}
```

**Error - Trabajador no encontrado:**
```json
{
  "error": "Trabajador no encontrado o inactivo"
}
```

#### Paso 2: Validar Caja (Escanear QR o ingresar código)
```http
POST /api/entregas/validar_caja/
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "CAJA-IND-001",
  "sucursal": "casablanca"
}
```

**Respuesta exitosa:**
```json
{
  "id": 1,
  "codigo": "CAJA-IND-001",
  "tipo_contrato": "indefinido",
  "sucursal": "casablanca",
  "cantidad_disponible": 150,
  "activa": true
}
```

**Error - Incompatibilidad de sucursal:**
```json
{
  "error": "La caja no pertenece a la sucursal del trabajador",
  "caja_sucursal": "Valparaíso – Planta BIF",
  "trabajador_sucursal": "casablanca"
}
```

**Error - Sin stock:**
```json
{
  "error": "No hay stock disponible de esta caja",
  "caja": {
    "id": 1,
    "codigo": "CAJA-IND-001",
    "cantidad_disponible": 0
  }
}
```

#### Paso 3: Crear Entrega
```http
POST /api/entregas/crear_entrega_completa/
Authorization: Bearer {token}
Content-Type: application/json

{
  "trabajador_rut": "12345678-9",
  "caja_codigo": "CAJA-IND-001",
  "observaciones": "Entrega normal"
}
```

O con códigos QR:
```json
{
  "trabajador_qr": "12345678-9",
  "caja_qr": "CAJA-IND-001",
  "observaciones": ""
}
```

**Respuesta exitosa:**
```json
{
  "id": 45,
  "trabajador": 1,
  "trabajador_detalle": {
    "id": 1,
    "rut": "12345678-9",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo_contrato": "indefinido",
    "sucursal": "casablanca"
  },
  "caja": 1,
  "caja_detalle": {
    "id": 1,
    "codigo": "CAJA-IND-001",
    "tipo_contrato": "indefinido",
    "cantidad_disponible": 149
  },
  "guardia": 5,
  "guardia_detalle": {
    "id": 5,
    "username": "guardia01",
    "first_name": "Pedro",
    "last_name": "González",
    "rol": "guardia"
  },
  "fecha_entrega": "2024-01-15T10:30:45Z",
  "estado": "entregado",
  "observaciones": "Entrega normal",
  "validado_supervisor": false
}
```

**Error - Incompatibilidad de tipo de contrato:**
```json
{
  "caja": [
    "Incompatibilidad de tipo de contrato: trabajador a plazo, caja para indefinidos"
  ]
}
```

### 2. Consultar Mis Entregas de Hoy

```http
GET /api/entregas/mis_entregas_hoy/
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "count": 15,
  "fecha": "2024-01-15",
  "entregas": [
    {
      "id": 45,
      "trabajador_nombre": "Juan Pérez",
      "trabajador_rut": "12345678-9",
      "guardia_nombre": "Pedro González",
      "caja_codigo": "CAJA-IND-001",
      "caja_tipo": "Indefinido",
      "fecha_entrega": "2024-01-15T10:30:45Z",
      "estado": "entregado",
      "estado_display": "Entregado",
      "validado_supervisor": false,
      "observaciones": "Entrega normal"
    }
  ]
}
```

### 3. Estadísticas del Guardia

```http
GET /api/entregas/estadisticas_guardia/
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "entregas_hoy": 15,
  "entregas_semana": 73,
  "entregas_mes": 312,
  "promedio_diario": 20.8,
  "por_estado": [
    {
      "estado": "entregado",
      "total": 300
    },
    {
      "estado": "no_entregado",
      "total": 12
    }
  ],
  "fecha_consulta": "2024-01-15"
}
```

### 4. Listar Entregas con Filtros

```http
GET /api/entregas/?estado=entregado&validado_supervisor=false
Authorization: Bearer {token}
```

### 5. Entregas Pendientes de Validación (Supervisor)

```http
GET /api/entregas/entregas_pendientes_validacion/
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "count": 8,
  "entregas": [
    {
      "id": 45,
      "trabajador_nombre": "Juan Pérez",
      "fecha_entrega": "2024-01-15T10:30:45Z",
      "estado": "entregado",
      "validado_supervisor": false
    }
  ]
}
```

### 6. Validar Entrega (Supervisor)

```http
POST /api/entregas/45/validar_entrega/
Authorization: Bearer {token}
Content-Type: application/json

{
  "comentario": "Entrega verificada correctamente"
}
```

**Respuesta:**
```json
{
  "id": 45,
  "validado_supervisor": true,
  "supervisor": 3,
  "fecha_validacion": "2024-01-15T11:00:00Z",
  "observaciones": "Entrega normal\n\nValidación supervisor: Entrega verificada correctamente"
}
```

### 7. Reporte Diario

```http
GET /api/entregas/reporte_diario/?fecha=2024-01-15
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "fecha": "2024-01-15",
  "total_entregas": 245,
  "entregas_validadas": 220,
  "entregas_pendientes": 25,
  "por_guardia": [
    {
      "guardia__username": "guardia01",
      "guardia__first_name": "Pedro",
      "guardia__last_name": "González",
      "total": 15
    }
  ],
  "por_sucursal": [
    {
      "caja__sucursal": "casablanca",
      "total": 150
    },
    {
      "caja__sucursal": "valparaiso_bif",
      "total": 95
    }
  ],
  "por_tipo_contrato": [
    {
      "caja__tipo_contrato": "indefinido",
      "total": 180
    },
    {
      "caja__tipo_contrato": "plazo_fijo",
      "total": 65
    }
  ]
}
```

---

## 🚨 INCIDENCIAS

### 1. Crear Incidencia

```http
POST /api/incidencias/
Authorization: Bearer {token}
Content-Type: application/json

{
  "trabajador": 1,
  "tipo": "qr_no_funciona",
  "descripcion": "El código QR del trabajador no se pudo escanear. Tuve que ingresar el RUT manualmente.",
  "rut_trabajador_manual": "12345678-9"
}
```

**Respuesta:**
```json
{
  "id": 10,
  "trabajador": 1,
  "trabajador_detalle": {
    "id": 1,
    "rut": "12345678-9",
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "guardia": 5,
  "guardia_detalle": {
    "username": "guardia01",
    "first_name": "Pedro"
  },
  "tipo": "qr_no_funciona",
  "descripcion": "El código QR del trabajador no se pudo escanear...",
  "prioridad": "media",
  "estado": "pendiente",
  "fecha_reporte": "2024-01-15T10:45:00Z",
  "rut_trabajador_manual": "12345678-9"
}
```

### 2. Listar Mis Incidencias (Guardia)

```http
GET /api/incidencias/mis-incidencias/
Authorization: Bearer {token}
```

### 3. Incidencias Pendientes (Supervisor)

```http
GET /api/incidencias/pendientes/
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "count": 5,
  "incidencias": [
    {
      "id": 10,
      "tipo": "qr_no_funciona",
      "tipo_display": "QR no funciona",
      "prioridad": "media",
      "estado": "pendiente",
      "trabajador_nombre": "Juan Pérez",
      "guardia_nombre": "Pedro González",
      "fecha_reporte": "2024-01-15T10:45:00Z",
      "esta_vencida": false
    }
  ]
}
```

### 4. Resolver Incidencia (Supervisor)

```http
PATCH /api/incidencias/10/resolver/
Authorization: Bearer {token}
Content-Type: application/json

{
  "solucion": "Se imprimió nueva credencial con QR funcional para el trabajador"
}
```

**Respuesta:**
```json
{
  "id": 10,
  "estado": "resuelto",
  "supervisor": 3,
  "solucion": "Se imprimió nueva credencial con QR funcional para el trabajador",
  "fecha_resolucion": "2024-01-15T11:30:00Z"
}
```

### 5. Tomar Incidencia en Proceso (Supervisor)

```http
PATCH /api/incidencias/10/tomar-en-proceso/
Authorization: Bearer {token}
```

### 6. Rechazar Incidencia (Supervisor)

```http
PATCH /api/incidencias/10/rechazar/
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo": "El problema reportado no es válido"
}
```

---

## 📊 CASOS DE USO COMPLETOS

### Caso 1: Flujo Normal de Entrega

1. **Guardia escanea QR del trabajador**
   ```bash
   POST /api/entregas/validar_trabajador/
   Body: { "qr_code": "12345678-9" }
   ```

2. **Sistema muestra detalle del trabajador**
   - Nombre completo
   - RUT
   - Tipo de contrato
   - Sucursal

3. **Guardia escanea QR de la caja**
   ```bash
   POST /api/entregas/validar_caja/
   Body: { "qr_code": "CAJA-IND-001", "sucursal": "casablanca" }
   ```

4. **Sistema muestra detalle de la caja**
   - Código
   - Tipo de contrato
   - Stock disponible

5. **Guardia confirma la entrega**
   ```bash
   POST /api/entregas/crear_entrega_completa/
   Body: {
     "trabajador_qr": "12345678-9",
     "caja_qr": "CAJA-IND-001"
   }
   ```

6. **Sistema crea la entrega y descuenta inventario**

### Caso 2: Registro de Incidencia

1. **Guardia intenta escanear QR pero falla**

2. **Guardia presiona botón "Registrar Incidencia"**

3. **Guardia llena el formulario:**
   ```bash
   POST /api/incidencias/
   Body: {
     "tipo": "qr_no_funciona",
     "descripcion": "QR del trabajador no escanea",
     "rut_trabajador_manual": "12345678-9"
   }
   ```

4. **Sistema registra la incidencia y notifica al supervisor**

### Caso 3: Supervisor Resuelve Incidencia

1. **Supervisor ve incidencias pendientes**
   ```bash
   GET /api/incidencias/pendientes/
   ```

2. **Supervisor toma la incidencia en proceso**
   ```bash
   PATCH /api/incidencias/10/tomar-en-proceso/
   ```

3. **Supervisor resuelve el problema y marca como resuelto**
   ```bash
   PATCH /api/incidencias/10/resolver/
   Body: {
     "solucion": "Se imprimió nueva credencial"
   }
   ```

---

## 🔴 MANEJO DE ERRORES

### Errores Comunes

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```
**Solución:** Incluir token en header `Authorization: Bearer {token}`

#### 403 Forbidden
```json
{
  "error": "Solo supervisores pueden validar entregas"
}
```
**Solución:** Verificar que el usuario tenga el rol correcto

#### 404 Not Found
```json
{
  "error": "Trabajador no encontrado o inactivo"
}
```
**Solución:** Verificar que el RUT/QR sea correcto

#### 400 Bad Request - Validación
```json
{
  "caja": [
    "No hay stock disponible de esta caja en Casablanca"
  ]
}
```
**Solución:** Mostrar mensaje al usuario y permitir seleccionar otra caja

---

## 💡 TIPS PARA EL FRONTEND

### 1. Almacenar Token
```javascript
// Guardar en localStorage
localStorage.setItem('access_token', response.data.access);
localStorage.setItem('refresh_token', response.data.refresh);

// Configurar axios
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### 2. Interceptor para Refresh Token
```javascript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Intentar refrescar token
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        const response = await axios.post('/api/auth/refresh/', {
          refresh: refreshToken
        });
        localStorage.setItem('access_token', response.data.access);
        // Reintentar request original
        error.config.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axios(error.config);
      } catch {
        // Redirect a login
        window.location = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 3. Manejo de Estados de Carga
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const validarTrabajador = async (rut) => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.post('/entregas/validar_trabajador/', { rut });
    return response.data;
  } catch (err) {
    setError(err.response?.data?.error || 'Error desconocido');
    throw err;
  } finally {
    setLoading(false);
  }
};
```

### 4. Polling para Notificaciones
```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await api.get('/incidencias/pendientes/');
    setIncidenciasPendientes(response.data.count);
  }, 30000); // Cada 30 segundos
  
  return () => clearInterval(interval);
}, []);
```

---

## 📱 EJEMPLO DE CONFIGURACIÓN AXIOS

```javascript
// src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh/`,
          { refresh: refreshToken }
        );
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🎯 ENDPOINTS RESUMIDOS

### Autenticación
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Usuario actual

### Trabajadores
- `GET /api/trabajadores/` - Listar
- `POST /api/trabajadores/buscar-por-rut/` - Buscar por RUT

### Cajas
- `GET /api/cajas/` - Listar
- `GET /api/cajas/disponibles-por-sucursal/` - Por sucursal

### Entregas
- `POST /api/entregas/validar_trabajador/` - Validar trabajador
- `POST /api/entregas/validar_caja/` - Validar caja
- `POST /api/entregas/crear_entrega_completa/` - Crear entrega
- `GET /api/entregas/mis_entregas_hoy/` - Mis entregas hoy
- `GET /api/entregas/estadisticas_guardia/` - Estadísticas
- `GET /api/entregas/entregas_pendientes_validacion/` - Pendientes validación
- `POST /api/entregas/{id}/validar_entrega/` - Validar entrega
- `GET /api/entregas/reporte_diario/` - Reporte diario

### Incidencias
- `GET /api/incidencias/` - Listar
- `POST /api/incidencias/` - Crear
- `GET /api/incidencias/pendientes/` - Pendientes
- `GET /api/incidencias/mis-incidencias/` - Mis incidencias
- `PATCH /api/incidencias/{id}/resolver/` - Resolver
- `PATCH /api/incidencias/{id}/tomar-en-proceso/` - Tomar
- `PATCH /api/incidencias/{id}/rechazar/` - Rechazar
