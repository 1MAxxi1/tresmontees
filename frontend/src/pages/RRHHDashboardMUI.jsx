import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={2}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          color: 'white', 
          bgcolor: color, 
          p: 1, 
          borderRadius: 1,
          mr: 2 
        }}>
          {icon}
        </Box>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const RRHHDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrabajadores: 0,
    activos: 0,
    entregasHoy: 0,
    totalEntregas: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [trabajadoresRes, entregasRes] = await Promise.all([
        api.get('/trabajadores/'),
        api.get('/entregas/')
      ]);

      const trabajadores = trabajadoresRes.data;
      const entregas = entregasRes.data;

      const hoy = new Date().toISOString().split('T')[0];
      const entregasHoy = entregas.filter(e => 
        e.fecha_entrega?.startsWith(hoy)
      ).length;

      setStats({
        totalTrabajadores: trabajadores.length,
        activos: trabajadores.filter(t => t.activo).length,
        entregasHoy: entregasHoy,
        totalEntregas: entregas.length,
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
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
      
      toast.success('Reporte Excel descargado');
    } catch (error) {
      toast.error('Error descargando Excel');
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Bienvenido, {user.first_name || 'RRHH'}. Aquí tienes un resumen del sistema.
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Trabajadores"
            value={stats.totalTrabajadores}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle={`${stats.activos} activos`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Entregas Hoy"
            value={stats.entregasHoy}
            icon={<ShippingIcon />}
            color="#ed6c02"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Entregas"
            value={stats.totalEntregas}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Trabajadores Inactivos"
            value={stats.totalTrabajadores - stats.activos}
            icon={<WarningIcon />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* Exportar Reportes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Exportar Reportes
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={exportarExcel}
              sx={{ py: 1.5 }}
            >
              Exportar Excel
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<FileDownloadIcon />}
              onClick={exportarPDF}
              sx={{ py: 1.5 }}
            >
              Exportar PDF
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={exportarCSV}
              sx={{ py: 1.5 }}
            >
              Exportar CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Actividad Reciente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                No hay actividad reciente para mostrar
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información del Sistema
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Usuario:</Typography>
                <Typography variant="body2">{user.username || 'rrhh01'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Rol:</Typography>
                <Typography variant="body2" fontWeight="medium">{user.rol?.toUpperCase() || 'RRHH'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Versión:</Typography>
                <Typography variant="body2">1.0.0</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Estado:</Typography>
                <Typography variant="body2" color="success.main">● En línea</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RRHHDashboard;