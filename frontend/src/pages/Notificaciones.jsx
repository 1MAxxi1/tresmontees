import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterIcon,
  LocalShipping as EntregaIcon,
  Warning as WarningIcon,
  Inventory as StockIcon,
  Campaign as CampanaIcon,
  PersonAdd as PersonIcon,
  DeleteSweep as CleanIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [estadisticas, setEstadisticas] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  useEffect(() => {
    cargarNotificaciones();
    cargarEstadisticas();
  }, [filtroTipo]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroTipo !== 'todas') {
        params.tipo = filtroTipo;
      }
      
      const response = await api.get('/notificaciones/', { params });
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await api.get('/notificaciones/estadisticas/');
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.post(`/notificaciones/${id}/marcar-leida/`);
      cargarNotificaciones();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar notificación');
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.post('/notificaciones/marcar-todas-leidas/');
      toast.success('Todas las notificaciones marcadas como leídas');
      cargarNotificaciones();
      cargarEstadisticas();
      setConfirmDialog({ open: false, action: null });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar notificaciones');
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await api.delete(`/notificaciones/${id}/eliminar/`);
      toast.success('Notificación eliminada');
      cargarNotificaciones();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  const limpiarAntiguas = async () => {
    try {
      const response = await api.post('/notificaciones/limpiar-antiguas/');
      toast.success(response.data.message);
      cargarNotificaciones();
      cargarEstadisticas();
      setConfirmDialog({ open: false, action: null });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al limpiar notificaciones');
    }
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      resumen_entregas: <EntregaIcon />,
      incidencia_nueva: <WarningIcon />,
      stock_bajo: <StockIcon />,
      campana_vence: <CampanaIcon />,
      trabajador_nuevo: <PersonIcon />,
    };
    return iconos[tipo] || <NotificationsIcon />;
  };

  const getColorPrioridad = (prioridad) => {
    const colores = {
      baja: '#2196f3',
      media: '#ff9800',
      alta: '#f44336',
    };
    return colores[prioridad] || '#2196f3';
  };

  const notificacionesFiltradas = notificaciones;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Centro de Notificaciones
            </Typography>
            {estadisticas && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {estadisticas.no_leidas} sin leer de {estadisticas.total} totales
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={() => setConfirmDialog({ open: true, action: 'marcar-todas' })}
            disabled={!estadisticas || estadisticas.no_leidas === 0}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: '#4caf50',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
              },
            }}
          >
            Marcar Todas
          </Button>

          <Button
            variant="outlined"
            startIcon={<CleanIcon />}
            onClick={() => setConfirmDialog({ open: true, action: 'limpiar' })}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: '#f44336',
                bgcolor: 'rgba(244, 67, 54, 0.1)',
              },
            }}
          >
            Limpiar Antiguas
          </Button>
        </Box>
      </Box>

      {/* Estadísticas */}
      {estadisticas && estadisticas.total > 0 ? (
        estadisticas.por_tipo && Object.keys(estadisticas.por_tipo).length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(estadisticas.por_tipo).map(([tipo, datos]) => (
              <Grid item xs={12} sm={6} md={2.4} key={tipo}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: '#102010',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                  onClick={() => setFiltroTipo(filtroTipo === tipo ? 'todas' : tipo)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color: filtroTipo === tipo ? '#4caf50' : 'white', mr: 1 }}>
                      {getIconoTipo(tipo)}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {datos.nombre}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ color: filtroTipo === tipo ? '#4caf50' : 'white', fontWeight: 'bold' }}>
                    {datos.count}
                  </Typography>
                  {datos.no_leidas > 0 && (
                    <Chip
                      label={`${datos.no_leidas} nuevas`}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: 'rgba(244, 67, 54, 0.2)',
                        color: '#f44336',
                        fontSize: '0.7rem',
                        height: '20px',
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )
      ) : null}

      {/* Filtro de vista - Solo mostrar si hay notificaciones */}
      {estadisticas && estadisticas.total > 0 && (
        <Paper sx={{ mb: 3, bgcolor: '#102010', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Tabs
            value={filtroTipo}
            onChange={(e, newValue) => setFiltroTipo(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': {
                  color: '#4caf50',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#4caf50',
              },
            }}
          >
            <Tab value="todas" label="Todas" />
            <Tab value="resumen_entregas" label="Entregas" />
            <Tab value="incidencia_nueva" label="Incidencias" />
            <Tab value="stock_bajo" label="Stock" />
            <Tab value="campana_vence" label="Campañas" />
            <Tab value="trabajador_nuevo" label="Trabajadores" />
          </Tabs>
        </Paper>
      )}

      {/* Lista de Notificaciones */}
      {notificacionesFiltradas.length === 0 ? (
        <Paper sx={{ p: 6, bgcolor: '#102010', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            No hay notificaciones
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            {filtroTipo === 'todas' 
              ? 'No tienes notificaciones en este momento'
              : `No hay notificaciones de tipo "${filtroTipo.replace('_', ' ')}"`
            }
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ bgcolor: '#102010', border: '1px solid rgba(255,255,255,0.1)' }}>
          <List sx={{ p: 0 }}>
            {notificacionesFiltradas.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    py: 2.5,
                    px: 3,
                    bgcolor: notif.leida ? 'transparent' : 'rgba(76, 175, 80, 0.05)',
                    borderLeft: `4px solid ${getColorPrioridad(notif.prioridad)}`,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: getColorPrioridad(notif.prioridad), minWidth: 50 }}>
                    {getIconoTipo(notif.tipo)}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                          {notif.titulo}
                        </Typography>
                        {!notif.leida && (
                          <Chip
                            label="Nueva"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(76, 175, 80, 0.2)',
                              color: '#4caf50',
                              fontSize: '0.7rem',
                              height: '20px',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        <Chip
                          label={notif.prioridad_nombre}
                          size="small"
                          sx={{
                            bgcolor: `${getColorPrioridad(notif.prioridad)}20`,
                            color: getColorPrioridad(notif.prioridad),
                            fontSize: '0.7rem',
                            height: '20px',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, lineHeight: 1.6 }}
                        >
                          {notif.mensaje}
                        </Typography>

                        {/* Información adicional según el tipo */}
                        {notif.tipo === 'resumen_entregas' && notif.datos_extra.sucursales && (
                          <Box sx={{ mt: 1 }}>
                            {Object.entries(notif.datos_extra.sucursales).map(([sucursal, cantidad]) => (
                              <Chip
                                key={sucursal}
                                label={`${sucursal}: ${cantidad}`}
                                size="small"
                                sx={{
                                  mr: 0.5,
                                  mt: 0.5,
                                  bgcolor: 'rgba(33, 150, 243, 0.2)',
                                  color: '#2196f3',
                                  fontSize: '0.75rem',
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        {notif.tipo === 'stock_bajo' && notif.datos_extra && (
                          <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                            Solo {notif.datos_extra.cantidad} cajas disponibles
                          </Alert>
                        )}

                        {notif.tipo === 'campana_vence' && notif.datos_extra && (
                          <Typography variant="caption" sx={{ color: '#ff9800', display: 'block', mt: 1 }}>
                            ⏰ Finaliza: {new Date(notif.datos_extra.fecha_fin).toLocaleDateString('es-ES')}
                          </Typography>
                        )}

                        <Typography component="div" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
                          {notif.tiempo_transcurrido}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!notif.leida && (
                      <Tooltip title="Marcar como leída">
                        <IconButton
                          size="small"
                          onClick={() => marcarComoLeida(notif.id)}
                          sx={{ color: '#4caf50' }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => eliminarNotificacion(notif.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < notificacionesFiltradas.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Dialog de Confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        PaperProps={{ sx: { bgcolor: '#102010', color: 'white' } }}
      >
        <DialogTitle>
          {confirmDialog.action === 'marcar-todas' ? 'Marcar todas como leídas' : 'Limpiar notificaciones antiguas'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {confirmDialog.action === 'marcar-todas'
              ? '¿Está seguro de marcar todas las notificaciones como leídas?'
              : '¿Está seguro de eliminar todas las notificaciones leídas de más de 30 días?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDialog.action === 'marcar-todas' ? marcarTodasLeidas : limpiarAntiguas}
            variant="contained"
            sx={{
              bgcolor: confirmDialog.action === 'marcar-todas' ? '#2e7d32' : '#f44336',
              '&:hover': {
                bgcolor: confirmDialog.action === 'marcar-todas' ? '#1b5e20' : '#d32f2f',
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notificaciones;