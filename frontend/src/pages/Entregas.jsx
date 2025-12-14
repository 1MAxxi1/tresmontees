import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { LocalShipping as ShippingIcon } from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Entregas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEntregas();
  }, []);

  const cargarEntregas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entregas/');
      setEntregas(response.data);
    } catch (error) {
      console.error('Error cargando entregas:', error);
      toast.error('Error cargando entregas');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        <ShippingIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Gestión de Entregas
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Historial de Entregas" />
        <Tab label="Estadísticas" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {entregas.length === 0 ? (
            <Alert severity="info">
              No hay entregas registradas en el sistema
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajador</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUT</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caja</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Guardia</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entregas.map((entrega) => (
                    <TableRow 
                      key={entrega.id}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>
                        {entrega.trabajador?.nombre} {entrega.trabajador?.apellido_paterno}
                      </TableCell>
                      <TableCell>{entrega.trabajador?.rut}</TableCell>
                      <TableCell>
                        <Chip 
                          label={entrega.caja?.codigo || 'N/A'}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{entrega.guardia?.username || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(entrega.fecha_entrega).toLocaleString('es-ES')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Total de entregas: {entregas.length}
            </Typography>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Estadísticas de Entregas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">Total de entregas:</Typography>
              <Typography variant="h4">{entregas.length}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Entregas hoy:</Typography>
              <Typography variant="h4">
                {entregas.filter(e => {
                  const hoy = new Date().toISOString().split('T')[0];
                  return e.fecha_entrega?.startsWith(hoy);
                }).length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Entregas;