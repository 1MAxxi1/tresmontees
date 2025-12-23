import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Replay as ReopenIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Función helper para formatear fechas - Maneja microsegundos de Django
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  
  try {
    // Si la fecha viene como string con microsegundos, los removemos
    let fechaLimpia = fecha;
    if (typeof fecha === 'string') {
      // Remover microsegundos: de .957005-03:00 a .957-03:00
      fechaLimpia = fecha.replace(/(\.\d{3})\d+/, '$1');
    }
    
    const date = new Date(fechaLimpia);
    
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', fecha);
      return 'Fecha inválida';
    }
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    
    return `${dia}-${mes}-${anio} ${horas}:${minutos} hrs`;
  } catch (error) {
    console.error('Error formateando fecha:', error, fecha);
    return 'Error';
  }
};

const SupervisorIncidencias = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || '');
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    cargarIncidencias();
  }, [filtroEstado, busquedaTexto]);

  const cargarIncidencias = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (busquedaTexto) params.busqueda = busquedaTexto;

      const response = await api.get('/supervisor/incidencias/', { params });
      setIncidencias(response.data.data || []);
    } catch (error) {
      console.error('Error cargando incidencias:', error);
      toast.error('Error cargando incidencias');
    } finally {
      setLoading(false);
    }
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
        solucion: comentario
      });

      toast.success('Incidencia actualizada correctamente');
      cerrarModal();
      cargarIncidencias();
    } catch (error) {
      console.error('Error actualizando incidencia:', error);
      toast.error('Error al actualizar incidencia');
    }
  };

  const reabrirIncidencia = async (id) => {
    if (!window.confirm('¿Está seguro de que desea reabrir esta incidencia?')) {
      return;
    }

    try {
      await api.patch(`/supervisor/incidencias/${id}/reabrir/`);
      toast.success('Incidencia reabierta correctamente');
      cargarIncidencias();
    } catch (error) {
      console.error('Error reabriendo incidencia:', error);
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

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'baja': return 'info';
      case 'media': return 'warning';
      case 'alta': return 'error';
      default: return 'default';
    }
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setBusquedaTexto('');
    setSearchParams({});
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
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        Gestión de Incidencias
      </Typography>

      {/* Filtros - Diseño profesional mejorado */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: '#102010', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 'bold', fontSize: '1.1rem' }}>
          Filtros de Búsqueda
        </Typography>
        
        <Grid container spacing={3}>
          {/* FILTRO POR ESTADO */}
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontSize: '0.875rem' }}>
              Estado de la incidencia
            </Typography>
            <FormControl fullWidth>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '.MuiSvgIcon-root': { color: 'white' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' }
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
                <MenuItem value="pendiente">Pendientes</MenuItem>
                <MenuItem value="aprobado">Aprobadas</MenuItem>
                <MenuItem value="rechazado">Rechazadas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* BÚSQUEDA POR TEXTO */}
          <Grid item xs={12} md={5}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontSize: '0.875rem' }}>
              Buscar incidencia
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese RUT, nombre del trabajador o descripción..."
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
                '& .MuiOutlinedInput-notchedOutline': { 
                  borderColor: 'rgba(255,255,255,0.2)' 
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { 
                  borderColor: 'rgba(255,255,255,0.3)' 
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': { 
                  borderColor: '#4caf50' 
                }
              }}
            />
          </Grid>

          {/* BOTONES */}
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontSize: '0.875rem' }}>
              Acciones
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={cargarIncidencias}
                sx={{ 
                  bgcolor: '#2e7d32',
                  height: '56px',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
              >
                Aplicar
              </Button>
              {(filtroEstado || busquedaTexto) && (
                <Button
                  variant="outlined"
                  onClick={limpiarFiltros}
                  sx={{ 
                    color: 'white',
                    height: '56px',
                    minWidth: '56px',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { 
                      borderColor: '#f44336',
                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                      color: '#f44336'
                    }
                  }}
                  title="Limpiar filtros"
                >
                  <ClearIcon />
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* INFORMACIÓN DE RESULTADOS */}
        <Box sx={{ 
          mt: 3, 
          pt: 3, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
              Mostrando <strong style={{ color: '#4caf50' }}>{incidencias.length}</strong> de <strong>{incidencias.length}</strong> incidencias
            </Typography>
            {filtroEstado && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Filtro aplicado: {filtroEstado}
              </Typography>
            )}
          </Box>
          
          {(filtroEstado || busquedaTexto) && (
            <Chip
              label="Filtros activos"
              onDelete={limpiarFiltros}
              deleteIcon={<ClearIcon sx={{ color: 'white !important' }} />}
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                color: '#4caf50',
                borderColor: '#4caf50',
                border: '1px solid',
                '& .MuiChip-deleteIcon:hover': {
                  color: '#f44336 !important'
                }
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Tabla de Incidencias */}
      {incidencias.length === 0 ? (
        <Alert severity="info">No hay incidencias para mostrar</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#102010' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#09320f' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajador</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prioridad</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidencias.map((incidencia) => (
                <TableRow 
                  key={incidencia.id}
                  sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                  <TableCell sx={{ color: 'white' }}>{incidencia.id}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip 
                      label={incidencia.tipo_nombre} 
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {incidencia.trabajador?.nombre_completo || 'N/A'}
                    <br />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      RUT: {incidencia.trabajador?.rut || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'white', maxWidth: 200 }}>
                    {incidencia.descripcion}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={incidencia.prioridad_nombre}
                      color={getPrioridadColor(incidencia.prioridad)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getEstadoTexto(incidencia.estado)}
                      color={getEstadoColor(incidencia.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {formatearFecha(incidencia.fecha_reporte)}
                  </TableCell>
                  <TableCell>
                    {incidencia.estado === 'pendiente' ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => abrirModal(incidencia, 'aprobado')}
                          sx={{ color: '#4caf50' }}
                          title="Aprobar"
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => abrirModal(incidencia, 'rechazado')}
                          sx={{ color: '#f44336' }}
                          title="Rechazar"
                        >
                          <RejectIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => reabrirIncidencia(incidencia.id)}
                        sx={{ color: '#ff9800' }}
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

      {/* Modal de Confirmación */}
      <Dialog 
        open={modalOpen} 
        onClose={cerrarModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#102010', color: 'white' }
        }}
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

export default SupervisorIncidencias;