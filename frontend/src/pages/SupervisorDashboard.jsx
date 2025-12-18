import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Replay as ReopenIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card 
    elevation={2}
    sx={{ 
      cursor: onClick ? 'pointer' : 'default',
      bgcolor: '#102010',
      borderTop: `4px solid ${color}`,
      '&:hover': onClick ? { transform: 'scale(1.02)', transition: '0.2s' } : {}
    }}
    onClick={onClick}
  >
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
        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }} gutterBottom>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1, color: color, fontWeight: 'bold' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobados: 0,
    rechazados: 0,
  });
  const [incidencias, setIncidencias] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaTexto, setBusquedaTexto] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (supervisor) {
      cargarIncidencias();
    }
  }, [filtroEstado, supervisor]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [supervisorRes, statsRes, incidenciasRes] = await Promise.all([
        api.get('/supervisor/info/'),
        api.get('/supervisor/estadisticas/'),
        api.get('/supervisor/incidencias/')
      ]);

      setSupervisor(supervisorRes.data);
      setStats(statsRes.data);
      setIncidencias(incidenciasRes.data.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const cargarIncidencias = async () => {
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (busquedaTexto) params.busqueda = busquedaTexto;

      const response = await api.get('/supervisor/incidencias/', { params });
      setIncidencias(response.data.data || []);
    } catch (error) {
      console.error('Error cargando incidencias:', error);
      toast.error('Error cargando incidencias');
    }
  };

  const aplicarFiltros = () => {
    cargarIncidencias();
    toast.success('Filtros aplicados');
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setBusquedaTexto('');
    setSearchParams({});
    cargarIncidencias();
    toast.success('Filtros limpiados');
  };

  const abrirModal = (incidencia, accion) => {
    setIncidenciaSeleccionada(incidencia);
    setAccionPendiente(accion);
    setComentario('');
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setIncidenciaSeleccionada(null);
    setAccionPendiente(null);
    setComentario('');
  };

  const confirmarAccion = async () => {
    if (!comentario.trim()) {
      toast.error('Debe agregar un comentario');
      return;
    }

    if (comentario.length > 500) {
      toast.error('El comentario no puede exceder 500 caracteres');
      return;
    }

    try {
      await api.patch(`/supervisor/incidencias/${incidenciaSeleccionada.id}/actualizar/`, {
        estado: accionPendiente,
        comentario_resolucion: comentario
      });

      toast.success('Incidencia actualizada correctamente');
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar incidencia');
    }
  };

  const reabrirIncidencia = async (id) => {
    if (!window.confirm('¿Está seguro de que desea reabrir esta incidencia?')) return;

    try {
      await api.patch(`/supervisor/incidencias/${id}/reabrir/`);
      toast.success('Incidencia reabierta correctamente');
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al reabrir incidencia');
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return 'warning';
      case 'aprobado': return 'success';
      case 'rechazado': return 'error';
      default: return 'default';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  const getFiltroTexto = () => {
    switch(filtroEstado) {
      case 'pendiente': return 'Pendientes';
      case 'aprobado': return 'Aprobadas';
      case 'rechazado': return 'Rechazadas';
      default: return 'Todas';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Filtrar incidencias por búsqueda de texto
  const incidenciasFiltradas = incidencias.filter(inc => {
    if (!busquedaTexto) return true;
    
    const texto = busquedaTexto.toLowerCase();
    return (
      inc.descripcion?.toLowerCase().includes(texto) ||
      inc.tipo_nombre?.toLowerCase().includes(texto) ||
      inc.trabajador?.rut?.includes(texto) ||
      inc.trabajador?.nombre_completo?.toLowerCase().includes(texto) ||
      inc.comentario_resolucion?.toLowerCase().includes(texto)
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Dashboard Supervisor
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Bienvenido, {supervisor?.nombre || 'Supervisor'}. Gestión de incidencias.
        </Typography>
      </Box>

      {/* Estadísticas - Tarjetas con colores del original */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Incidencias"
            value={stats.total}
            icon={<AssignmentIcon />}
            color="#3b82f6"
            subtitle="Casos asignados"
            onClick={() => {
              setFiltroEstado('');
              cargarIncidencias();
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendientes"
            value={stats.pendientes}
            icon={<PendingIcon />}
            color="#f59e0b"
            subtitle="Requieren atención"
            onClick={() => {
              setFiltroEstado('pendiente');
              setTimeout(() => cargarIncidencias(), 100);
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aprobadas"
            value={stats.aprobados}
            icon={<CheckCircleIcon />}
            color="#10b981"
            subtitle="Casos aprobados"
            onClick={() => {
              setFiltroEstado('aprobado');
              setTimeout(() => cargarIncidencias(), 100);
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rechazadas"
            value={stats.rechazados}
            icon={<CancelIcon />}
            color="#8b5cf6"
            subtitle="Casos rechazados"
            onClick={() => {
              setFiltroEstado('rechazado');
              setTimeout(() => cargarIncidencias(), 100);
            }}
          />
        </Grid>
      </Grid>

      {/* Filtros - CON DROPDOWN DE ESTADO */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#102010' }}>
        <Grid container spacing={2} alignItems="center">
          {/* FILTRO POR ESTADO - ESTO ES LO QUE FALTABA */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white' }}>📊 Filtrar por estado:</InputLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                label="📊 Filtrar por estado:"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#1a1a1a',
                      '& .MuiMenuItem-root': {
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.2)'
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(76, 175, 80, 0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.4)'
                          }
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="">Todas las incidencias</MenuItem>
                <MenuItem value="pendiente">Solo pendientes</MenuItem>
                <MenuItem value="aprobado">Solo aprobadas</MenuItem>
                <MenuItem value="rechazado">Solo rechazadas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* BÚSQUEDA POR TEXTO */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="🔎 Buscar por caso, trabajador, RUT..."
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              sx={{
                input: { color: 'white' },
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }
              }}
            />
          </Grid>

          {/* BOTÓN APLICAR FILTROS */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={aplicarFiltros}
              startIcon={<FilterIcon />}
              sx={{ 
                bgcolor: '#2e7d32', 
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              Aplicar Filtros
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            📊 Total: {incidenciasFiltradas.length} incidencias | Filtro: {getFiltroTexto()}
          </Typography>
          
          {(filtroEstado || busquedaTexto) && (
            <Button
              size="small"
              variant="outlined"
              onClick={limpiarFiltros}
              startIcon={<ClearIcon />}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { borderColor: '#4caf50', color: '#4caf50' }
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </Box>
      </Paper>

      {/* Tabla de Incidencias */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
        Incidencias Asignadas
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
        Gestiona el estado de cada caso asignado a tu área
      </Typography>

      {incidenciasFiltradas.length === 0 ? (
        <Alert severity="info">No hay incidencias para mostrar con los filtros aplicados</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#102010' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#09320f' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajador</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidenciasFiltradas.map((inc) => (
                <TableRow key={inc.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <TableCell sx={{ color: 'white' }}>{inc.id}</TableCell>
                  <TableCell>
                    <Chip label={inc.tipo_nombre} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {inc.trabajador?.nombre_completo}
                    <br />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      RUT: {inc.trabajador?.rut}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'white', maxWidth: 200 }}>{inc.descripcion}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getEstadoTexto(inc.estado)}
                      color={getEstadoColor(inc.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {new Date(inc.fecha_creacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {inc.estado === 'pendiente' ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => abrirModal(inc, 'aprobado')}
                          sx={{ color: '#10b981' }}
                          title="Aprobar"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => abrirModal(inc, 'rechazado')}
                          sx={{ color: '#ef4444' }}
                          title="Rechazar"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => reabrirIncidencia(inc.id)}
                        sx={{ color: '#f59e0b' }}
                        title="Reabrir"
                      >
                        <ReopenIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Aprobación/Rechazo */}
      <Dialog 
        open={modalOpen} 
        onClose={cerrarModal} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { bgcolor: '#102010', color: 'white' } }}
      >
        <DialogTitle>
          {accionPendiente === 'aprobado' ? '✓ Aprobar Incidencia' : '✗ Rechazar Incidencia'}
        </DialogTitle>
        <DialogContent>
          {incidenciaSeleccionada && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tipo:</strong> {incidenciaSeleccionada.tipo_nombre}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Trabajador:</strong> {incidenciaSeleccionada.trabajador?.nombre_completo}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Descripción:</strong> {incidenciaSeleccionada.descripcion}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentario de resolución (obligatorio)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            helperText={`${comentario.length}/500 caracteres`}
            sx={{
              '& .MuiInputBase-root': { color: 'white' },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarAccion}
            variant="contained"
            color={accionPendiente === 'aprobado' ? 'success' : 'error'}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupervisorDashboard;