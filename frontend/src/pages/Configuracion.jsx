import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Configuracion = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para Sucursales
  const [sucursales, setSucursales] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [modalSucursalOpen, setModalSucursalOpen] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);
  const [formSucursal, setFormSucursal] = useState({
    nombre: '',
    codigo: '',
    direccion: '',
  });
  
  // Estados para Áreas
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [modalAreaOpen, setModalAreaOpen] = useState(false);
  const [areaEditando, setAreaEditando] = useState(null);
  const [formArea, setFormArea] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });

  useEffect(() => {
    cargarSucursales();
    cargarAreas();
  }, []);

  // ==================== SUCURSALES ====================

  const cargarSucursales = async () => {
    try {
      setLoadingSucursales(true);
      const response = await api.get('/sucursales/');
      setSucursales(response.data);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      toast.error('Error cargando sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  const abrirModalSucursal = (sucursal = null) => {
    if (sucursal) {
      setSucursalEditando(sucursal);
      setFormSucursal({
        nombre: sucursal.nombre,
        codigo: sucursal.codigo,
        direccion: sucursal.direccion || '',
      });
    } else {
      setSucursalEditando(null);
      setFormSucursal({
        nombre: '',
        codigo: '',
        direccion: '',
      });
    }
    setModalSucursalOpen(true);
  };

  const cerrarModalSucursal = () => {
    setModalSucursalOpen(false);
    setSucursalEditando(null);
    setFormSucursal({ nombre: '', codigo: '', direccion: '' });
  };

  const guardarSucursal = async () => {
    if (!formSucursal.nombre.trim() || !formSucursal.codigo.trim()) {
      toast.error('Nombre y código son obligatorios');
      return;
    }

    try {
      if (sucursalEditando) {
        // Actualizar
        await api.patch(`/sucursales/${sucursalEditando.id}/`, formSucursal);
        toast.success('Sucursal actualizada correctamente');
      } else {
        // Crear
        await api.post('/sucursales/crear/', formSursal);
        toast.success('Sucursal creada correctamente');
      }
      cerrarModalSucursal();
      cargarSucursales();
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.nombre?.[0] || 
                      error.response?.data?.codigo?.[0] ||
                      'Error al guardar sucursal';
      toast.error(errorMsg);
    }
  };

  const toggleSucursal = async (sucursal) => {
    const endpoint = sucursal.activa ? 'desactivar' : 'activar';
    const accion = sucursal.activa ? 'desactivar' : 'activar';

    if (sucursal.activa) {
      // Validar si puede desactivarse
      if (!sucursal.puede_desactivarse.puede) {
        toast.error(sucursal.puede_desactivarse.mensaje);
        return;
      }

      if (!window.confirm(`¿Está seguro de ${accion} la sucursal "${sucursal.nombre}"?`)) {
        return;
      }
    }

    try {
      await api.post(`/sucursales/${sucursal.id}/${endpoint}/`);
      toast.success(`Sucursal ${accion === 'activar' ? 'activada' : 'desactivada'} correctamente`);
      cargarSucursales();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || `Error al ${accion} sucursal`);
    }
  };

  const eliminarSucursal = async (sucursal) => {
    if (!sucursal.puede_desactivarse.puede) {
      toast.error(sucursal.puede_desactivarse.mensaje);
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar la sucursal "${sucursal.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/sucursales/${sucursal.id}/`);
      toast.success('Sucursal eliminada correctamente');
      cargarSucursales();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar sucursal');
    }
  };

  // ==================== ÁREAS ====================

  const cargarAreas = async () => {
    try {
      setLoadingAreas(true);
      const response = await api.get('/areas/');
      setAreas(response.data);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      toast.error('Error cargando áreas');
    } finally {
      setLoadingAreas(false);
    }
  };

  const abrirModalArea = (area = null) => {
    if (area) {
      setAreaEditando(area);
      setFormArea({
        nombre: area.nombre,
        codigo: area.codigo,
        descripcion: area.descripcion || '',
      });
    } else {
      setAreaEditando(null);
      setFormArea({
        nombre: '',
        codigo: '',
        descripcion: '',
      });
    }
    setModalAreaOpen(true);
  };

  const cerrarModalArea = () => {
    setModalAreaOpen(false);
    setAreaEditando(null);
    setFormArea({ nombre: '', codigo: '', descripcion: '' });
  };

  const guardarArea = async () => {
    if (!formArea.nombre.trim() || !formArea.codigo.trim()) {
      toast.error('Nombre y código son obligatorios');
      return;
    }

    try {
      if (areaEditando) {
        // Actualizar
        await api.patch(`/areas/${areaEditando.id}/`, formArea);
        toast.success('Área actualizada correctamente');
      } else {
        // Crear
        await api.post('/areas/crear/', formArea);
        toast.success('Área creada correctamente');
      }
      cerrarModalArea();
      cargarAreas();
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.nombre?.[0] || 
                      error.response?.data?.codigo?.[0] ||
                      'Error al guardar área';
      toast.error(errorMsg);
    }
  };

  const toggleArea = async (area) => {
    const endpoint = area.activa ? 'desactivar' : 'activar';
    const accion = area.activa ? 'desactivar' : 'activar';

    if (area.activa) {
      // Validar si puede desactivarse
      if (!area.puede_desactivarse.puede) {
        toast.error(area.puede_desactivarse.mensaje);
        return;
      }

      if (!window.confirm(`¿Está seguro de ${accion} el área "${area.nombre}"?`)) {
        return;
      }
    }

    try {
      await api.post(`/areas/${area.id}/${endpoint}/`);
      toast.success(`Área ${accion === 'activar' ? 'activada' : 'desactivada'} correctamente`);
      cargarAreas();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || `Error al ${accion} área`);
    }
  };

  const eliminarArea = async (area) => {
    if (!area.puede_desactivarse.puede) {
      toast.error(area.puede_desactivarse.mensaje);
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar el área "${area.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/areas/${area.id}/`);
      toast.success('Área eliminada correctamente');
      cargarAreas();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar área');
    }
  };

  // ==================== RENDER ====================

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Configuración del Sistema
        </Typography>
      </Box>

      <Paper sx={{ bgcolor: '#102010', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
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
          <Tab icon={<BusinessIcon />} label="Sucursales" />
          <Tab icon={<DashboardIcon />} label="Áreas" />
        </Tabs>

        {/* TAB SUCURSALES */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Gestión de Sucursales
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => abrirModalSucursal()}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                }}
              >
                Agregar Sucursal
              </Button>
            </Box>

            {loadingSucursales ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : sucursales.length === 0 ? (
              <Alert severity="info">No hay sucursales registradas</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#09320f' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dirección</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajadores</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sucursales.map((sucursal) => (
                      <TableRow key={sucursal.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <TableCell>
                          <Chip
                            label={sucursal.activa ? 'Activa' : 'Inactiva'}
                            color={sucursal.activa ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>{sucursal.nombre}</TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          <Chip label={sucursal.codigo} size="small" sx={{ bgcolor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }} />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                          {sucursal.direccion || 'No especificada'}
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          {sucursal.total_trabajadores}
                          {sucursal.total_trabajadores_inactivos > 0 && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                              (+{sucursal.total_trabajadores_inactivos} inactivos)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => abrirModalSucursal(sucursal)}
                              sx={{ color: '#2196f3' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={sucursal.activa ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              onClick={() => toggleSucursal(sucursal)}
                              sx={{ color: sucursal.activa ? '#ff9800' : '#4caf50' }}
                              disabled={sucursal.activa && !sucursal.puede_desactivarse.puede}
                            >
                              {sucursal.activa ? <DeactivateIcon /> : <ActivateIcon />}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={sucursal.puede_desactivarse.puede ? 'Eliminar' : sucursal.puede_desactivarse.mensaje}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => eliminarSucursal(sucursal)}
                                sx={{ color: '#f44336' }}
                                disabled={!sucursal.puede_desactivarse.puede}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB ÁREAS */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Gestión de Áreas
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => abrirModalArea()}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                }}
              >
                Agregar Área
              </Button>
            </Box>

            {loadingAreas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : areas.length === 0 ? (
              <Alert severity="info">No hay áreas registradas</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#09320f' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajadores</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {areas.map((area) => (
                      <TableRow key={area.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <TableCell>
                          <Chip
                            label={area.activa ? 'Activa' : 'Inactiva'}
                            color={area.activa ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>{area.nombre}</TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          <Chip label={area.codigo} size="small" sx={{ bgcolor: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' }} />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', maxWidth: 300 }}>
                          {area.descripcion || 'No especificada'}
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          {area.total_trabajadores}
                          {area.total_trabajadores_inactivos > 0 && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                              (+{area.total_trabajadores_inactivos} inactivos)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => abrirModalArea(area)}
                              sx={{ color: '#2196f3' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={area.activa ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              onClick={() => toggleArea(area)}
                              sx={{ color: area.activa ? '#ff9800' : '#4caf50' }}
                              disabled={area.activa && !area.puede_desactivarse.puede}
                            >
                              {area.activa ? <DeactivateIcon /> : <ActivateIcon />}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={area.puede_desactivarse.puede ? 'Eliminar' : area.puede_desactivarse.mensaje}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => eliminarArea(area)}
                                sx={{ color: '#f44336' }}
                                disabled={!area.puede_desactivarse.puede}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* MODAL SUCURSAL */}
      <Dialog
        open={modalSucursalOpen}
        onClose={cerrarModalSucursal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#102010', color: 'white' } }}
      >
        <DialogTitle>
          {sucursalEditando ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formSucursal.nombre}
              onChange={(e) => setFormSucursal({ ...formSucursal, nombre: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
              helperText="Ejemplo: Casablanca, Valparaíso - Planta BIF"
              FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
            />

            <TextField
              fullWidth
              label="Código"
              value={formSucursal.codigo}
              onChange={(e) => setFormSucursal({ ...formSucursal, codigo: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
              helperText="Código único (solo letras, números y guiones bajos). Ejemplo: casablanca, valparaiso_bif"
              FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
              disabled={sucursalEditando !== null}
            />

            <TextField
              fullWidth
              label="Dirección (opcional)"
              value={formSucursal.direccion}
              onChange={(e) => setFormSucursal({ ...formSucursal, direccion: e.target.value })}
              multiline
              rows={2}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalSucursal} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button
            onClick={guardarSucursal}
            variant="contained"
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
            }}
          >
            {sucursalEditando ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL ÁREA */}
      <Dialog
        open={modalAreaOpen}
        onClose={cerrarModalArea}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#102010', color: 'white' } }}
      >
        <DialogTitle>
          {areaEditando ? 'Editar Área' : 'Nueva Área'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formArea.nombre}
              onChange={(e) => setFormArea({ ...formArea, nombre: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
              helperText="Ejemplo: Producción y Manufactura, Logística"
              FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
            />

            <TextField
              fullWidth
              label="Código"
              value={formArea.codigo}
              onChange={(e) => setFormArea({ ...formArea, codigo: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
              helperText="Código único (solo letras, números y guiones bajos). Ejemplo: produccion_manufactura"
              FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
              disabled={areaEditando !== null}
            />

            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formArea.descripcion}
              onChange={(e) => setFormArea({ ...formArea, descripcion: e.target.value })}
              multiline
              rows={3}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalArea} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button
            onClick={guardarArea}
            variant="contained"
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
            }}
          >
            {areaEditando ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Configuracion;