import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, User, Package, CheckCircle, AlertTriangle, 
  LogOut, ArrowLeft, Camera, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axios';
import '../mobile-styles.css';

export default function GuardiaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('inicio');
  const [trabajador, setTrabajador] = useState(null);
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rutInput, setRutInput] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  // Estados para QR Scanner
  const [scanningType, setScanningType] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  
  // Estados para incidencias
  const [rutTrabajadorIncidencia, setRutTrabajadorIncidencia] = useState('');
  const [descripcionIncidencia, setDescripcionIncidencia] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (showScanner && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const onScanSuccess = async (decodedText) => {
    console.log('QR escaneado:', decodedText);
    
    // Detener el escáner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error(err));
      scannerRef.current = null;
    }
    
    setShowScanner(false);
    
    if (scanningType === 'trabajador') {
      setRutInput(decodedText);
      await validarTrabajadorConRut(decodedText);
    } else if (scanningType === 'caja') {
      setCodigoInput(decodedText);
      await validarCajaConCodigo(decodedText);
    }
  };

  const onScanError = (error) => {
    // No mostrar errores de lectura, son normales
    console.debug('Error de lectura:', error);
  };

  const startScanning = (type) => {
    setScanningType(type);
    setShowScanner(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error(err));
      scannerRef.current = null;
    }
    setShowScanner(false);
    setScanningType(null);
  };

  const validarTrabajadorConRut = async (rut) => {
    if (!rut.trim()) {
      toast.error('RUT inválido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/entregas/validar_trabajador/', {
        rut: rut.trim()
      });
      setTrabajador(response.data);
      setStep('caja');
      toast.success('Trabajador validado ✓');
      setRutInput('');
      setShowManualInput(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error validando trabajador');
    } finally {
      setLoading(false);
    }
  };

  const validarTrabajador = async (e) => {
    e.preventDefault();
    await validarTrabajadorConRut(rutInput);
  };

  const validarCajaConCodigo = async (codigo) => {
    if (!codigo.trim()) {
      toast.error('Código inválido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/entregas/validar_caja/', {
        codigo: codigo.trim(),
        sucursal: trabajador.sucursal
      });
      setCaja(response.data);
      setStep('confirmar');
      toast.success('Caja validada ✓');
      setCodigoInput('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error validando caja');
    } finally {
      setLoading(false);
    }
  };

  const validarCaja = async (e) => {
    e.preventDefault();
    await validarCajaConCodigo(codigoInput);
  };

  const confirmarEntrega = async () => {
    setLoading(true);
    try {
      await api.post('/entregas/crear_entrega_completa/', {
        trabajador_rut: trabajador.rut,
        caja_codigo: caja.codigo
      });

      setStep('exito');
      toast.success('¡Entrega registrada con éxito!');

      setTimeout(() => {
        resetFlow();
      }, 2500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creando entrega');
    } finally {
      setLoading(false);
    }
  };

  const registrarIncidencia = async (e) => {
    e.preventDefault();
    
    if (!descripcionIncidencia.trim()) {
      toast.error('Debes describir el problema');
      return;
    }

    setLoading(true);
    try {
      await api.post('/incidencias/crear_incidencia/', {
        rut_trabajador: rutTrabajadorIncidencia.trim() || null,
        descripcion: descripcionIncidencia.trim()
      });

      setStep('incidencia-exitosa');
      toast.success('¡Incidencia registrada!');
      
      setTimeout(() => {
        resetFlow();
      }, 2500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error registrando incidencia');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('inicio');
    setTrabajador(null);
    setCaja(null);
    setRutInput('');
    setCodigoInput('');
    setShowManualInput(false);
    setRutTrabajadorIncidencia('');
    setDescripcionIncidencia('');
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error(err));
      scannerRef.current = null;
    }
    setShowScanner(false);
    setScanningType(null);
  };

  return (
    <div className="dashboard-container">
      <Toaster position="bottom-center" />

      {/* Modal de Escáner QR */}
      {showScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <button
            onClick={stopScanning}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <X size={30} color="#000" />
          </button>

          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            marginTop: '60px',
            textAlign: 'center'
          }}>
            {scanningType === 'trabajador' ? 'Escanear QR del Trabajador' : 'Escanear QR de la Caja'}
          </h2>

          {/* Contenedor del escáner */}
          <div id="qr-reader" style={{ width: '100%', maxWidth: '500px' }}></div>

          <p style={{
            color: 'white',
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '1rem',
            opacity: 0.9
          }}>
            Apunta la cámara al código QR
          </p>

          {scanningType === 'trabajador' && (
            <button
              onClick={() => {
                stopScanning();
                setShowManualInput(true);
              }}
              style={{
                marginTop: '30px',
                padding: '15px 30px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
            >
              ✏️ Ingresar Manualmente
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mobile-header">
        <div className="header-content">
          <div className="header-left">
            {step !== 'inicio' && (
              <button onClick={resetFlow} className="back-button">
                <ArrowLeft size={22} color="white" />
              </button>
            )}
            <div className="user-info">
              <h3>{user?.first_name || 'Guardia'}</h3>
              <p>{user?.rol}</p>
            </div>
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={22} color="white" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="dashboard-content">
        
        {/* PANTALLA INICIAL */}
        {step === 'inicio' && (
          <>
            <button onClick={() => setStep('escanear')} className="action-card">
              <div className="action-icon green">
                <QrCode />
              </div>
              <h3 className="action-title">Escanear QR</h3>
              <p className="action-subtitle">Escanear código QR del trabajador</p>
            </button>

            <button 
              onClick={() => setStep('incidencia')} 
              className="action-card"
            >
              <div className="action-icon orange">
                <AlertTriangle size={55} />
              </div>
              <h3 className="action-title">Registrar Incidencia</h3>
              <p className="action-subtitle">Reportar un problema o novedad</p>
            </button>
          </>
        )}

        {/* PANTALLA ESCANEAR */}
        {step === 'escanear' && (
          <div className="validation-card">
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <button
                onClick={() => startScanning('trabajador')}
                style={{
                  width: '280px',
                  height: '280px',
                  margin: '0 auto 1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: '220px',
                  height: '220px',
                  border: '4px solid white',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={80} color="white" />
                </div>
              </button>
              
              <h2 className="validation-title" style={{marginBottom: '0.5rem'}}>
                Toca para Escanear
              </h2>
              <p className="action-subtitle" style={{fontSize: '1rem', color: '#6b7280'}}>
                Presiona el cuadro para activar la cámara
              </p>
            </div>

            <div className="divider">
              <span className="divider-text">O también puedes</span>
            </div>

            {!showManualInput ? (
              <button
                onClick={() => setShowManualInput(true)}
                className="btn-primary btn-blue"
                style={{marginBottom: '1rem'}}
              >
                ✏️ Ingresar Manualmente
              </button>
            ) : (
              <form onSubmit={validarTrabajador}>
                <div className="form-section">
                  <input
                    type="text"
                    value={rutInput}
                    onChange={(e) => setRutInput(e.target.value)}
                    placeholder="Ingrese RUT (ej: 12345678-9)"
                    className="input-field"
                    style={{textAlign: 'center'}}
                    autoFocus
                  />
                </div>

                <div className="form-section">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary btn-blue"
                  >
                    {loading ? 'Validando...' : 'Validar Trabajador'}
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={() => setStep('incidencia')}
              className="btn-secondary"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                marginTop: '1rem'
              }}
            >
              ⚠️ Registrar Incidencia
            </button>
          </div>
        )}

        {/* PANTALLA REGISTRAR INCIDENCIA */}
        {step === 'incidencia' && (
          <div className="validation-card">
            <div className="validation-header">
              <div className="validation-icon orange" style={{background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}}>
                <AlertTriangle />
              </div>
              <h2 className="validation-title">Registrar Incidencia</h2>
            </div>

            <form onSubmit={registrarIncidencia}>
              <div className="form-section">
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  RUT del trabajador (opcional)
                </label>
                <input
                  type="text"
                  value={rutTrabajadorIncidencia}
                  onChange={(e) => setRutTrabajadorIncidencia(e.target.value)}
                  placeholder="12345678-9"
                  className="input-field"
                  style={{
                    padding: '1rem 1.25rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-section">
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Describe el problema *
                </label>
                <textarea
                  value={descripcionIncidencia}
                  onChange={(e) => setDescripcionIncidencia(e.target.value)}
                  placeholder="Describe detalladamente el problema o novedad..."
                  required
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    background: '#f3f4f6',
                    border: '3px solid #e5e7eb',
                    borderRadius: '18px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    color: '#1f2937',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '140px'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#f97316';
                    e.target.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="form-section">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {loading ? 'Guardando...' : '💾 Guardar'}
                </button>
              </div>

              <button
                type="button"
                onClick={resetFlow}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* VALIDAR CAJA */}
        {step === 'caja' && trabajador && (
          <>
            <div className="info-card success">
              <div className="info-card-header">
                <CheckCircle size={24} />
                <span>Trabajador Validado</span>
              </div>
              <div className="info-row">
                <strong>Nombre:</strong> {trabajador.nombre} {trabajador.apellido}
              </div>
              <div className="info-row">
                <strong>RUT:</strong> {trabajador.rut}
              </div>
              <div className="info-row">
                <strong>Sucursal:</strong> {trabajador.sucursal}
              </div>
              <div className="info-row">
                <strong>Tipo Contrato:</strong> {trabajador.tipo_contrato}
              </div>
            </div>

            <div className="validation-card">
              <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                <button
                  onClick={() => startScanning('caja')}
                  style={{
                    width: '200px',
                    height: '200px',
                    margin: '0 auto 1rem',
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 40px rgba(168, 85, 247, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Package size={80} color="white" />
                </button>
                <h2 className="validation-title">Escanear Caja</h2>
              </div>

              <form onSubmit={validarCaja}>
                <div className="form-section">
                  <input
                    type="text"
                    value={codigoInput}
                    onChange={(e) => setCodigoInput(e.target.value)}
                    placeholder="O ingresa el código manualmente"
                    className="input-field"
                    style={{textAlign: 'center'}}
                  />
                </div>

                <div className="form-section">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary btn-purple"
                  >
                    {loading ? 'Validando...' : 'Validar Caja'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* CONFIRMAR ENTREGA */}
        {step === 'confirmar' && trabajador && caja && (
          <div className="validation-card">
            <h2 className="validation-title" style={{marginBottom: '2rem'}}>Confirmar Entrega</h2>
            
            <div className="info-card blue">
              <div className="info-card-header">
                <span>Trabajador</span>
              </div>
              <div className="info-row">
                <strong>{trabajador.nombre} {trabajador.apellido}</strong>
              </div>
              <div className="info-row">{trabajador.rut}</div>
              <div className="info-row">{trabajador.sucursal}</div>
            </div>

            <div className="info-card purple">
              <div className="info-card-header">
                <span>Caja</span>
              </div>
              <div className="info-row">
                <strong>{caja.codigo}</strong>
              </div>
              <div className="info-row">Stock disponible: {caja.cantidad_disponible}</div>
            </div>

            <div className="form-section">
              <button
                onClick={confirmarEntrega}
                disabled={loading}
                className="btn-primary btn-success"
                style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}
              >
                {loading ? 'Procesando...' : (
                  <>
                    <CheckCircle size={24} />
                    Confirmar Entrega
                  </>
                )}
              </button>
            </div>

            <button
              onClick={resetFlow}
              disabled={loading}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ÉXITO ENTREGA */}
        {step === 'exito' && (
          <div className="validation-card">
            <div className="success-screen">
              <div className="success-icon-lg">
                <CheckCircle />
              </div>
              <h2 className="success-title">¡Entrega Exitosa!</h2>
              <p className="success-message">Registro completado correctamente</p>
            </div>
          </div>
        )}

        {/* ÉXITO INCIDENCIA */}
        {step === 'incidencia-exitosa' && (
          <div className="validation-card">
            <div className="success-screen">
              <div className="success-icon-lg" style={{background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}}>
                <CheckCircle />
              </div>
              <h2 className="success-title">¡Incidencia Registrada!</h2>
              <p className="success-message">El reporte ha sido enviado correctamente</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}