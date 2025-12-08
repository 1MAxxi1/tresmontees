import { useState, useEffect } from 'react';
import { Camera, X, AlertTriangle, CheckCircle, Clock, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function IncidenciasGuardia({ onBack, onSuccess }) {
  const [step, setStep] = useState('menu'); // menu, crear, historial, detalle
  const [loading, setLoading] = useState(false);
  
  // Crear incidencia
  const [tiposIncidencia, setTiposIncidencia] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [rutTrabajador, setRutTrabajador] = useState('');
  const [codigoCaja, setCodigoCaja] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  
  // Historial
  const [incidencias, setIncidencias] = useState([]);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);

  useEffect(() => {
    cargarTiposIncidencia();
  }, []);

  const cargarTiposIncidencia = async () => {
    try {
      const response = await api.get('/incidencias/tipos_incidencia/');
      setTiposIncidencia(response.data);
    } catch (error) {
      console.error('Error cargando tipos:', error);
    }
  };

  const cargarMisIncidencias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/incidencias/mis_incidencias/');
      setIncidencias(response.data);
    } catch (error) {
      toast.error('Error cargando incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('La imagen no debe superar 5MB');
        return;
      }
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const tomarFoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implementar captura de foto
      toast.info('Funcionalidad de cámara en desarrollo');
    } catch (error) {
      toast.error('No se pudo acceder a la cámara');
    }
  };

  const registrarIncidencia = async (e) => {
    e.preventDefault();
    
    if (!tipoSeleccionado) {
      toast.error('Selecciona el tipo de incidencia');
      return;
    }
    
    if (!descripcion.trim()) {
      toast.error('Describe el problema');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('tipo', tipoSeleccionado);
      formData.append('descripcion', descripcion.trim());
      
      if (rutTrabajador.trim()) {
        formData.append('rut_trabajador', rutTrabajador.trim());
      }
      
      if (codigoCaja.trim()) {
        formData.append('codigo_caja', codigoCaja.trim());
      }
      
      if (imagen) {
        formData.append('imagen', imagen);
      }

      await api.post('/incidencias/crear_incidencia/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('¡Incidencia registrada!');
      
      // Limpiar formulario
      setTipoSeleccionado('');
      setRutTrabajador('');
      setCodigoCaja('');
      setDescripcion('');
      setImagen(null);
      setImagenPreview(null);
      
      if (onSuccess) onSuccess();
      setTimeout(() => setStep('menu'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error registrando incidencia');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (incidencia) => {
    setIncidenciaSeleccionada(incidencia);
    setStep('detalle');
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': '#f59e0b',
      'en_proceso': '#3b82f6',
      'resuelto': '#10b981',
      'rechazado': '#ef4444'
    };
    return colores[estado] || '#6b7280';
  };

  const getEstadoEmoji = (estado) => {
    const emojis = {
      'pendiente': '🟡',
      'en_proceso': '🔵',
      'resuelto': '🟢',
      'rechazado': '🔴'
    };
    return emojis[estado] || '⚪';
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* MENÚ PRINCIPAL */}
      {step === 'menu' && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>⚠️ Incidencias</h2>
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
          </div>

          <button
            onClick={() => setStep('crear')}
            style={{
              width: '100%',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(234, 88, 12, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
          >
            <AlertTriangle size={24} />
            Nueva Incidencia
          </button>

          <button
            onClick={() => {
              cargarMisIncidencias();
              setStep('historial');
            }}
            style={{
              width: '100%',
              padding: '1.5rem',
              background: 'white',
              color: '#1f2937',
              border: '3px solid #e5e7eb',
              borderRadius: '20px',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
          >
            📋 Mis Incidencias
          </button>
        </>
      )}

      {/* CREAR INCIDENCIA */}
      {step === 'crear' && (
        <form onSubmit={registrarIncidencia}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>Nueva Incidencia</h2>
            <button
              type="button"
              onClick={() => setStep('menu')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
          </div>

          {/* Tipo de Incidencia */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              1️⃣ Tipo de Problema *
            </label>
            <select
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                background: '#f9fafb',
                border: '3px solid #e5e7eb',
                borderRadius: '16px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Selecciona un tipo...</option>
              {tiposIncidencia.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.emoji} {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* RUT Trabajador */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              2️⃣ RUT del Trabajador (opcional)
            </label>
            <input
              type="text"
              value={rutTrabajador}
              onChange={(e) => setRutTrabajador(e.target.value)}
              placeholder="12345678-9"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                background: '#f9fafb',
                border: '3px solid #e5e7eb',
                borderRadius: '16px',
                outline: 'none'
              }}
            />
          </div>

          {/* Código Caja */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              📦 Código de Caja (opcional)
            </label>
            <input
              type="text"
              value={codigoCaja}
              onChange={(e) => setCodigoCaja(e.target.value)}
              placeholder="CAJA-CB-IND-001"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                background: '#f9fafb',
                border: '3px solid #e5e7eb',
                borderRadius: '16px',
                outline: 'none'
              }}
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              3️⃣ Describe el Problema *
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe detalladamente el problema..."
              required
              rows="5"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                background: '#f9fafb',
                border: '3px solid #e5e7eb',
                borderRadius: '16px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Foto */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              4️⃣ Evidencia Fotográfica (opcional)
            </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <label style={{
                padding: '1rem',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Camera size={20} />
                Subir Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button
                type="button"
                onClick={tomarFoto}
                style={{
                  padding: '1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Camera size={20} />
                Tomar Foto
              </button>
            </div>

            {imagenPreview && (
              <div style={{ position: 'relative' }}>
                <img
                  src={imagenPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    maxHeight: '200px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagen(null);
                    setImagenPreview(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Botones */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '0.75rem',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
            }}
          >
            {loading ? 'Guardando...' : '💾 Registrar Incidencia'}
          </button>

          <button
            type="button"
            onClick={() => setStep('menu')}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </form>
      )}

      {/* HISTORIAL */}
      {step === 'historial' && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>📋 Mis Incidencias</h2>
            <button
              onClick={() => setStep('menu')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Cargando...</p>
            </div>
          ) : incidencias.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.125rem' }}>No tienes incidencias registradas</p>
            </div>
          ) : (
            incidencias.map((incidencia) => (
              <div
                key={incidencia.id}
                onClick={() => verDetalle(incidencia)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  border: '2px solid #f3f4f6',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#f3f4f6'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{incidencia.emoji}</span>
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        {incidencia.tipo_display}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        {incidencia.tiempo_sin_resolver || 'Recién reportado'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: getEstadoColor(incidencia.estado) + '20',
                    color: getEstadoColor(incidencia.estado),
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {getEstadoEmoji(incidencia.estado)} {incidencia.estado_display}
                  </div>
                </div>

                <p style={{
                  color: '#4b5563',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {incidencia.descripcion}
                </p>

                {incidencia.solucion && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    borderLeft: '3px solid #10b981'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#059669',
                      fontWeight: '600',
                      marginBottom: '0.25rem'
                    }}>
                      ✓ Solución:
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#065f46'
                    }}>
                      {incidencia.solucion}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* DETALLE */}
      {step === 'detalle' && incidenciaSeleccionada && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>Detalle de Incidencia</h2>
            <button
              onClick={() => setStep('historial')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            {/* Encabezado */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <span style={{ fontSize: '3rem' }}>{incidenciaSeleccionada.emoji}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  {incidenciaSeleccionada.tipo_display}
                </h3>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {new Date(incidenciaSeleccionada.fecha_reporte).toLocaleString('es-ES')}
                </div>
              </div>
            </div>

            {/* Estado y Prioridad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  Estado
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: getEstadoColor(incidenciaSeleccionada.estado)
                }}>
                  {getEstadoEmoji(incidenciaSeleccionada.estado)} {incidenciaSeleccionada.estado_display}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  Prioridad
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: incidenciaSeleccionada.color_prioridad
                }}>
                  {incidenciaSeleccionada.prioridad_display}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Descripción:
              </div>
              <p style={{
                color: '#4b5563',
                lineHeight: '1.6',
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '12px'
              }}>
                {incidenciaSeleccionada.descripcion}
              </p>
            </div>

            {/* Imagen */}
            {incidenciaSeleccionada.imagen_evidencia && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Evidencia:
                </div>
                <img
                  src={incidenciaSeleccionada.imagen_evidencia}
                  alt="Evidencia"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    maxHeight: '300px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            {/* Solución */}
            {incidenciaSeleccionada.solucion && (
              <div style={{
                padding: '1rem',
                background: '#f0fdf4',
                borderRadius: '12px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: '0.5rem'
                }}>
                  ✓ Solución Aplicada:
                </div>
                <p style={{
                  color: '#065f46',
                  lineHeight: '1.6'
                }}>
                  {incidenciaSeleccionada.solucion}
                </p>
                {incidenciaSeleccionada.supervisor_detalle && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#059669'
                  }}>
                    Por: {incidenciaSeleccionada.supervisor_detalle.first_name || 'Supervisor'}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setStep('historial')}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Volver al Historial
          </button>
        </>
      )}
    </div>
  );
}