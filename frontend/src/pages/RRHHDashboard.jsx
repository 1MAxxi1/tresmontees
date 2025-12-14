import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, Bell, Users, Package, TrendingUp } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';

export default function RRHHDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_trabajadores: 0,
    total_entregas: 0,
    notificaciones_no_leidas: 0,
    entregas_hoy: 0
  });
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas básicas
      const [trabajadoresRes, entregasRes, notifRes] = await Promise.all([
        api.get('/trabajadores/'),
        api.get('/entregas/'),
        api.get('/notificaciones/no-leidas/')
      ]);

      setStats({
        total_trabajadores: trabajadoresRes.data.length,
        total_entregas: entregasRes.data.length,
        notificaciones_no_leidas: notifRes.data.no_leidas || 0,
        entregas_hoy: entregasRes.data.filter(e => {
          const hoy = new Date().toISOString().split('T')[0];
          return e.fecha_entrega.startsWith(hoy);
        }).length
      });

      // Cargar últimas notificaciones
      const notificacionesRes = await api.get('/notificaciones/');
      setNotificaciones(notificacionesRes.data.slice(0, 5));

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const exportarExcel = async () => {
    try {
      const response = await api.get('/reportes/exportar/excel/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_entregas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      toast.error('Error descargando reporte');
    }
  };

  const exportarPDF = async () => {
    try {
      const response = await api.get('/reportes/exportar/pdf/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_entregas.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte PDF descargado');
    } catch (error) {
      toast.error('Error descargando PDF');
    }
  };

  const exportarCSV = async () => {
    try {
      const response = await api.get('/reportes/exportar/csv/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_entregas.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte CSV descargado');
    } catch (error) {
      toast.error('Error descargando CSV');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Toaster position="bottom-center" />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        color: 'white',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Dashboard RRHH
            </h1>
            <p style={{ opacity: 0.9 }}>
              {user?.first_name || 'Usuario'} - {user?.rol || 'RRHH'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>

        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Trabajadores</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.total_trabajadores}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Entregas Hoy</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.entregas_hoy}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Entregas</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.total_entregas}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bell size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Notificaciones</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.notificaciones_no_leidas}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de Reportes */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#1f2937'
          }}>
            📊 Exportar Reportes
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <button
              onClick={exportarExcel}
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <FileText size={24} />
              Exportar Excel
            </button>

            <button
              onClick={exportarPDF}
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FileText size={24} />
              Exportar PDF
            </button>

            <button
              onClick={exportarCSV}
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FileText size={24} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Últimas Notificaciones */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#1f2937'
          }}>
            🔔 Últimas Notificaciones
          </h2>

          {notificaciones.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              No hay notificaciones recientes
            </p>
          ) : (
            notificaciones.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '1rem',
                  background: notif.leido ? '#f9fafb' : '#eff6ff',
                  borderRadius: '12px',
                  marginBottom: '0.75rem',
                  borderLeft: `4px solid ${notif.tipo === 'entrega' ? '#10b981' : '#3b82f6'}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.25rem'
                    }}>
                      {notif.titulo}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {notif.mensaje}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    {new Date(notif.creado_en).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}