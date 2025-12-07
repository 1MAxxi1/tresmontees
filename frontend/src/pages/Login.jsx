import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import '../mobile-styles.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setTimeout(() => {
        if (user.rol === 'guardia') {
          navigate('/guardia');
        } else if (user.rol === 'supervisor') {
          navigate('/supervisor');
        } else if (user.rol === 'rrhh') {
          navigate('/rrhh');
        } else {
          navigate('/guardia');
        }
      }, 500);
    } catch (error) {
      toast.error('Error al iniciar sesión. Verifica tus credenciales.', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px 24px',
          borderRadius: '12px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo y Título */}
        <div className="logo-container">
          <div className="logo">
            <Package size={55} />
          </div>
          <h1 className="welcome-title">Bienvenido</h1>
          <p className="welcome-subtitle">Sistema de Entregas</p>
        </div>

        {/* Formulario */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                required
                className="input-field"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Iniciando...
                </>
              ) : (
                <>
                  <LogIn size={24} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        <p className="footer-text">© 2024 Tres Montees</p>
      </div>
    </div>
  );
}