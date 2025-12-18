import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Configuracion = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Configuración del Sistema
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información del Usuario
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Usuario:</Typography>
            <Typography variant="body2" fontWeight="medium">{user.username}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Nombre:</Typography>
            <Typography variant="body2" fontWeight="medium">{user.first_name} {user.last_name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Email:</Typography>
            <Typography variant="body2" fontWeight="medium">{user.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Rol:</Typography>
            <Typography variant="body2" fontWeight="medium">{user.rol?.toUpperCase()}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información del Sistema
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Versión:</Typography>
            <Typography variant="body2">1.0.0</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Empresa:</Typography>
            <Typography variant="body2">Tres Montes Lucchetti</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="textSecondary">Estado:</Typography>
            <Typography variant="body2" color="success.main">● Operativo</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Configuracion;