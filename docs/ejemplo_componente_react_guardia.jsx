// ========================================
// EJEMPLO COMPLETO: Flujo Guardia - React
// ========================================

// src/pages/GuardiaDashboard.jsx
import { useState } from 'react';
import { QrCode, User, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function GuardiaDashboard() {
  const [step, setStep] = useState('inicio'); // inicio, trabajador, caja, confirmar, exito
  const [trabajador, setTrabajador] = useState(null);
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Obtener estadísticas al cargar
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/entregas/estadisticas_guardia/');
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // PASO 1: Validar Trabajador
  const validarTrabajador = async (rut) => {
    setLoading(true);
    try {
      const response = await api.post('/entregas/validar_trabajador/', { rut });
      setTrabajador(response.data);
      setStep('caja');
      toast.success(`Trabajador validado: ${response.data.nombre} ${response.data.apellido}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error validando trabajador');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Validar Caja
  const validarCaja = async (codigo) => {
    setLoading(true);
    try {
      const response = await api.post('/entregas/validar_caja/', {
        codigo,
        sucursal: trabajador.sucursal
      });
      setCaja(response.data);
      setStep('confirmar');
      toast.success(`Caja validada: ${response.data.codigo}`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error validando caja';
      toast.error(errorMsg);
      
      // Si es incompatibilidad, mostrar detalles
      if (error.response?.data?.caja_sucursal) {
        toast.error(
          `Sucursal incorrecta: Caja en ${error.response.data.caja_sucursal}, ` +
          `Trabajador en ${error.response.data.trabajador_sucursal}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Confirmar Entrega
  const confirmarEntrega = async () => {
    setLoading(true);
    try {
      const response = await api.post('/entregas/crear_entrega_completa/', {
        trabajador_rut: trabajador.rut,
        caja_codigo: caja.codigo,
        observaciones: ''
      });
      
      setStep('exito');
      toast.success('¡Entrega registrada exitosamente!');
      
      // Recargar estadísticas
      loadStats();
      
      // Volver al inicio después de 3 segundos
      setTimeout(() => {
        resetFlow();
      }, 3000);
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creando entrega');
      
      // Mostrar errores de validación
      if (error.response?.data?.caja) {
        error.response.data.caja.forEach(err => toast.error(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Resetear flujo
  const resetFlow = () => {
    setStep('inicio');
    setTrabajador(null);
    setCaja(null);
  };

  // Ir a registrar incidencia
  const irAIncidencia = () => {
    // Navegar a página de incidencias
    window.location.href = '/incidencias/nueva';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con estadísticas */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Guardia
          </h1>
          
          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Entregas Hoy</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.entregas_hoy}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.entregas_semana}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.entregas_mes}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* PASO: Inicio */}
        {step === 'inicio' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <QrCode className="w-24 h-24 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              Escanear QR del Trabajador
            </h2>
            <p className="text-gray-600 mb-6">
              Escanea el código QR de la credencial del trabajador o ingresa su RUT manualmente
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setStep('trabajador')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg 
                         hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                Escanear QR
              </button>
              
              <button
                onClick={() => setStep('trabajador')}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg 
                         hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                Ingresar RUT Manualmente
              </button>
              
              <button
                onClick={irAIncidencia}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg 
                         hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Registrar Incidencia
              </button>
            </div>
          </div>
        )}

        {/* PASO: Validar Trabajador */}
        {step === 'trabajador' && (
          <FormularioTrabajador
            onValidar={validarTrabajador}
            onCancelar={resetFlow}
            loading={loading}
          />
        )}

        {/* PASO: Validar Caja */}
        {step === 'caja' && trabajador && (
          <div className="space-y-6">
            {/* Mostrar detalle del trabajador */}
            <DetalleTrabajador trabajador={trabajador} />
            
            {/* Formulario para validar caja */}
            <FormularioCaja
              onValidar={validarCaja}
              onCancelar={resetFlow}
              loading={loading}
            />
          </div>
        )}

        {/* PASO: Confirmar Entrega */}
        {step === 'confirmar' && trabajador && caja && (
          <div className="space-y-6">
            <DetalleTrabajador trabajador={trabajador} />
            <DetalleCaja caja={caja} />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Confirmar Entrega</h3>
              <p className="text-gray-600 mb-6">
                ¿Confirmas la entrega de la caja <strong>{caja.codigo}</strong> al 
                trabajador <strong>{trabajador.nombre} {trabajador.apellido}</strong>?
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={confirmarEntrega}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg 
                           hover:bg-green-700 transition disabled:opacity-50
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmar Entrega
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetFlow}
                  disabled={loading}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg 
                           hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO: Éxito */}
        {step === 'exito' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              ¡Entrega Exitosa!
            </h2>
            <p className="text-gray-600 mb-6">
              La entrega se registró correctamente
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al inicio...
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

// ========================================
// Componente: Formulario Trabajador
// ========================================
function FormularioTrabajador({ onValidar, onCancelar, loading }) {
  const [rut, setRut] = useState('');
  const [useQR, setUseQR] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rut.trim()) {
      onValidar(rut);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Validar Trabajador</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {useQR ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escanear QR
            </label>
            {/* Aquí iría el componente de scanner QR */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                Apunta la cámara al código QR
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseQR(false)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Ingresar RUT manualmente
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUT del Trabajador
            </label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="12345678-9"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setUseQR(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Escanear QR en su lugar
            </button>
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || (!rut && !useQR)}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg 
                     hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Validar'}
          </button>
          
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg 
                     hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ========================================
// Componente: Formulario Caja
// ========================================
function FormularioCaja({ onValidar, onCancelar, loading }) {
  const [codigo, setCodigo] = useState('');
  const [useQR, setUseQR] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codigo.trim()) {
      onValidar(codigo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Escanear Caja</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {useQR ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escanear QR de la Caja
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                Apunta la cámara al código QR de la caja
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseQR(false)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Ingresar código manualmente
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de la Caja
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="CAJA-IND-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setUseQR(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Escanear QR en su lugar
            </button>
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || (!codigo && !useQR)}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg 
                     hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Validar Caja'}
          </button>
          
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg 
                     hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ========================================
// Componente: Detalle Trabajador
// ========================================
function DetalleTrabajador({ trabajador }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <User className="w-6 h-6 text-blue-500" />
        Detalle del Trabajador
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Nombre Completo</p>
          <p className="font-semibold">{trabajador.nombre} {trabajador.apellido}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">RUT</p>
          <p className="font-semibold">{trabajador.rut}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tipo de Contrato</p>
          <p className="font-semibold">
            {trabajador.tipo_contrato === 'indefinido' ? 'Contrato Indefinido' : 'Contrato a Plazo'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Sucursal</p>
          <p className="font-semibold">{trabajador.sucursal}</p>
        </div>
      </div>
      
      {trabajador.ultima_entrega && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            Última entrega: {new Date(trabajador.ultima_entrega.fecha).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ========================================
// Componente: Detalle Caja
// ========================================
function DetalleCaja({ caja }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Package className="w-6 h-6 text-green-500" />
        Detalle de la Caja
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Código</p>
          <p className="font-semibold">{caja.codigo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tipo de Contrato</p>
          <p className="font-semibold">
            {caja.tipo_contrato === 'indefinido' ? 'Indefinido' : 'Plazo Fijo'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Sucursal</p>
          <p className="font-semibold">{caja.sucursal}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Stock Disponible</p>
          <p className="font-semibold text-green-600">{caja.cantidad_disponible}</p>
        </div>
      </div>
    </div>
  );
}
