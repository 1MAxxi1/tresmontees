import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trabajadores/');
      setTrabajadores(response.data);
    } catch (error) {
      console.error('Error cargando trabajadores:', error);
      toast.error('Error cargando trabajadores');
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
        Gestión de Trabajadores
      </Typography>

      {trabajadores.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay trabajadores registrados en el sistema
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sede</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo Contrato</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trabajadores.map((trabajador) => (
                <TableRow 
                  key={trabajador.id}
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>{trabajador.rut}</TableCell>
                  <TableCell>
                    {trabajador.nombre} {trabajador.apellido_paterno} {trabajador.apellido_materno}
                  </TableCell>
                  <TableCell>{trabajador.sede}</TableCell>
                  <TableCell>{trabajador.cargo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={trabajador.tipo_contrato === 'indefinido' ? 'Indefinido' : 'Plazo Fijo'}
                      color={trabajador.tipo_contrato === 'indefinido' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={trabajador.activo ? 'Activo' : 'Inactivo'}
                      color={trabajador.activo ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          Total de trabajadores: {trabajadores.length}
        </Typography>
      </Box>
    </Box>
  );
}