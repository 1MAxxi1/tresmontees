import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, User, Package, CheckCircle, AlertTriangle, 
  LogOut, ArrowLeft, Camera, X, TrendingUp, Clock, Box
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axios';
import IncidenciasGuardia from '../components/IncidenciasGuardia';
import '../mobile-styles.css';
import '../mobile-styles-verde.css';

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
  
  // Estadísticas
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Estados para QR Scanner
  const [scanningType, setScanningType] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  
  // Estados para incidencias
  const [showIncidencias, setShowIncidencias] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    if (showScanner && !scannerRef.current) {
      // Detectar si es móvil o computador
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const config = { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      };
      
      // Solo en móviles, intentar usar cámara trasera
      if (isMobile) {
        config.videoConstraints = {
          facingMode: { ideal: "environment" }
        };
      }
      
      const scanner = new Html5QrcodeScanner("qr-reader", config, false);

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

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/entregas/estadisticas_guardia/');
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const onScanSuccess = async (decodedText) => {
    console.log('QR escaneado:', decodedText);
    
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

  // Función para formatear tipo de contrato
  const formatTipoContrato = (tipo) => {
    if (tipo === 'indefinido') return 'Indefinido';
    if (tipo === 'plazo_fijo') return 'Plazo Fijo';
    return tipo || 'No especificado';
  };

  // Función para formatear sucursal
  const formatSucursal = (sucursal) => {
    const sucursales = {
      'casablanca': 'Casablanca',
      'valparaiso_bif': 'Valparaíso – Planta BIF',
      'valparaiso_bic': 'Valparaíso – Planta BIC'
    };
    return sucursales[sucursal] || sucursal;
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
        sucursal: trabajador.sede
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

      // Recargar estadísticas
      setTimeout(() => {
        cargarEstadisticas();
        resetFlow();
      }, 2500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creando entrega');
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
        
        {/* PANTALLA INICIAL CON ESTADÍSTICAS */}
        {step === 'inicio' && (
          <>
            {/* Botones de Acción PRIMERO */}
            <button onClick={() => setStep('escanear')} className="action-card">
              <div className="action-icon green">
                <QrCode />
              </div>
              <h3 className="action-title">Escanear QR</h3>
              <p className="action-subtitle">Escanear código QR del trabajador</p>
            </button>

            <button 
              onClick={() => setShowIncidencias(true)}
              className="action-card"
            >
              <div className="action-icon orange">
                <AlertTriangle size={55} />
              </div>
              <h3 className="action-title">Registrar Incidencia</h3>
              <p className="action-subtitle">Reportar un problema o novedad</p>
            </button>

            {/* Panel de Estadísticas DESPUÉS */}
            {!loadingStats && stats && (
              <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                borderRadius: '24px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
                color: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    margin: 0
                  }}>📊 Estadísticas de Hoy</h2>
                  <span style={{
                    fontSize: '0.875rem',
                    opacity: 0.9
                  }}>{stats.hora_actual}</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✅</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.entregas_hoy}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Entregas hoy</div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📦</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.stock_total}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Stock disponible</div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📈</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.entregas_semana}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Esta semana</div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>⚠️</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.incidencias_pendientes}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Incidencias</div>
                  </div>
                </div>

                {stats.ultima_entrega && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>⏱️ Último registro:</div>
                    <div style={{ fontWeight: '600' }}>
                      {stats.ultima_entrega.trabajador} - {stats.ultima_entrega.hace}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Últimas Entregas */}
            {!loadingStats && stats && stats.entregas_recientes && stats.entregas_recientes.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#1f2937'
                }}>📜 Últimas Entregas</h3>

                {stats.entregas_recientes.map((entrega, index) => (
                  <div key={entrega.id} style={{
                    padding: '0.75rem',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: index < stats.entregas_recientes.length - 1 ? '0.75rem' : 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.25rem'
                      }}>{entrega.trabajador}</div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        RUT: {entrega.trabajador_rut} • {entrega.caja}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#059669',
                      fontWeight: '600'
                    }}>
                      {entrega.hora}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <strong>Nombre:</strong> {trabajador.nombre_completo || `${trabajador.nombre} ${trabajador.apellido_paterno}`}
              </div>
              <div className="info-row">
                <strong>RUT:</strong> {trabajador.rut}
              </div>
              <div className="info-row">
                <strong>Tipo Contrato:</strong> <span style={{fontWeight: 'bold', color: '#059669'}}>{formatTipoContrato(trabajador.tipo_contrato)}</span>
              </div>
              <div className="info-row">
                <strong>Sede:</strong> {formatSucursal(trabajador.sede || trabajador.sucursal)}
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
                <span>👤 Trabajador</span>
              </div>
              <div className="info-row">
                <strong>{trabajador.nombre_completo || `${trabajador.nombre} ${trabajador.apellido_paterno}`}</strong>
              </div>
              <div className="info-row">
                <strong>RUT:</strong> {trabajador.rut}
              </div>
              <div className="info-row">
                <strong>Tipo Contrato:</strong> <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: trabajador.tipo_contrato === 'indefinido' ? '#dcfce7' : '#fef3c7',
                  color: trabajador.tipo_contrato === 'indefinido' ? '#166534' : '#92400e',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {formatTipoContrato(trabajador.tipo_contrato)}
                </span>
              </div>
              <div className="info-row">
                <strong>Sede:</strong> {formatSucursal(trabajador.sede || trabajador.sucursal)}
              </div>
            </div>

            <div className="info-card purple">
              <div className="info-card-header">
                <span>📦 Caja</span>
              </div>
              <div className="info-row">
                <strong>Código:</strong> {caja.codigo}
              </div>
              <div className="info-row">
                <strong>Tipo:</strong> <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: caja.tipo_contrato === 'indefinido' ? '#dcfce7' : '#fef3c7',
                  color: caja.tipo_contrato === 'indefinido' ? '#166534' : '#92400e',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {formatTipoContrato(caja.tipo_contrato)}
                </span>
              </div>
              <div className="info-row">
                <strong>Sede:</strong> {formatSucursal(caja.sucursal)}
              </div>
              <div className="info-row">
                <strong>Stock disponible:</strong> {caja.cantidad_disponible}
              </div>
            </div>

            {/* Alerta si los tipos no coinciden */}
            {trabajador.tipo_contrato !== caja.tipo_contrato && (
              <div style={{
                padding: '1rem',
                background: '#fef2f2',
                border: '2px solid #fca5a5',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: '#991b1b',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}>
                  ⚠️ ADVERTENCIA: El tipo de contrato del trabajador ({formatTipoContrato(trabajador.tipo_contrato)}) 
                  no coincide con el tipo de caja ({formatTipoContrato(caja.tipo_contrato)})
                </p>
              </div>
            )}

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

      </div>

      {/* MODAL DE INCIDENCIAS */}
      {showIncidencias && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#f3f4f6',
          zIndex: 9999,
          overflowY: 'auto'
        }}>
          <IncidenciasGuardia 
            onBack={() => setShowIncidencias(false)}
            onSuccess={() => {
              cargarEstadisticas(); // Actualizar estadísticas
              setShowIncidencias(false);
            }}
          />
        </div>
      )}
    </div>
  );
}