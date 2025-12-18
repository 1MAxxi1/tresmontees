import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // PASO 1: Obtener tokens - URL CORREGIDA
      const tokenResponse = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Credenciales inválidas');
      }

      const tokenData = await tokenResponse.json();

      // Guardar tokens
      localStorage.setItem('access_token', tokenData.access);
      localStorage.setItem('refresh_token', tokenData.refresh);

      // PASO 2: Obtener información del usuario - URL CORREGIDA
      const userResponse = await fetch('http://127.0.0.1:8000/api/auth/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error obteniendo datos del usuario');
      }

      const userData = await userResponse.json();

      // Guardar información del usuario
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('✅ Login exitoso:', userData);

      // PASO 3: Redirigir según el rol
      if (userData.rol === 'guardia') {
        navigate('/guardia');
      } else if (userData.rol === 'rrhh' || userData.rol === 'admin') {
        navigate('/rrhh');
      } else if (userData.rol === 'supervisor') {
        navigate('/supervisor');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a1a0a',
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            Bienvenido
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Sistema de Entregas
          </Typography>
        </Box>

        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoFocus
              placeholder="rrhh01"
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              placeholder="password123"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                bgcolor: '#2e7d32',
                '&:hover': {
                  bgcolor: '#1b5e20',
                },
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
              Usuarios de prueba:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              rrhh01 / password123
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              supervisor01 / password123
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              guardia01 / password123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;