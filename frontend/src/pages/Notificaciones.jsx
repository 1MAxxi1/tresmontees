import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notificaciones/');
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <NotificationsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Centro de Notificaciones
      </Typography>

      {notificaciones.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay notificaciones en el sistema
        </Alert>
      ) : (
        <Paper sx={{ mt: 3 }}>
          <List>
            {notificaciones.map((notif) => (
              <ListItem 
                key={notif.id}
                sx={{ 
                  borderBottom: '1px solid #eee',
                  bgcolor: notif.leido ? 'transparent' : '#f0f7ff'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {notif.titulo}
                      {!notif.leido && (
                        <Chip label="Nueva" color="primary" size="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {notif.mensaje}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {new Date(notif.creado_en).toLocaleString('es-ES')}
                      </Typography>
                    </>
                  }
                />
                <Chip 
                  label={notif.tipo}
                  color={
                    notif.tipo === 'success' ? 'success' :
                    notif.tipo === 'warning' ? 'warning' :
                    notif.tipo === 'entrega' ? 'primary' : 'default'
                  }
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          Total de notificaciones: {notificaciones.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default Notificaciones;