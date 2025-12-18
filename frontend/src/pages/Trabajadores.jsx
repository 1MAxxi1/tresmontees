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
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode2 as QrIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Modal estados
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    cargo: '',
    departamento: '',
    tipo_contrato: 'indefinido',
    sede: 'casablanca',
    activo: true,
  });

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

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setTrabajadorSeleccionado(null);
    setFormData({
      rut: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      email: '',
      telefono: '',
      cargo: '',
      departamento: '',
      tipo_contrato: 'indefinido',
      sede: 'casablanca',
      activo: true,
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (trabajador) => {
    setModoEdicion(true);
    setTrabajadorSeleccionado(trabajador);
    setFormData({
      rut: trabajador.rut,
      nombre: trabajador.nombre,
      apellido_paterno: trabajador.apellido_paterno,
      apellido_materno: trabajador.apellido_materno || '',
      email: trabajador.email || '',
      telefono: trabajador.telefono || '',
      cargo: trabajador.cargo || '',
      departamento: trabajador.departamento || '',
      tipo_contrato: trabajador.tipo_contrato || 'indefinido',
      sede: trabajador.sede || 'casablanca',
      activo: trabajador.activo !== false,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setModoEdicion(false);
    setTrabajadorSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modoEdicion) {
        await api.put(`/trabajadores/${trabajadorSeleccionado.id}/`, formData);
        toast.success('Trabajador actualizado correctamente');
      } else {
        await api.post('/trabajadores/', formData);
        toast.success('Trabajador creado correctamente');
      }
      
      cerrarModal();
      cargarTrabajadores();
    } catch (error) {
      console.error('Error guardando trabajador:', error);
      toast.error(error.response?.data?.error || 'Error al guardar trabajador');
    }
  };

  const eliminarTrabajador = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este trabajador?')) {
      return;
    }

    try {
      await api.delete(`/trabajadores/${id}/`);
      toast.success('Trabajador eliminado correctamente');
      cargarTrabajadores();
    } catch (error) {
      console.error('Error eliminando trabajador:', error);
      toast.error('Error al eliminar trabajador');
    }
  };

  const generarQR = async (trabajador) => {
    try {
      await api.post(`/trabajadores/${trabajador.id}/generar_qr/`);
      toast.success(`QR generado para ${trabajador.nombre}`);
      cargarTrabajadores();
    } catch (error) {
      console.error('Error generando QR:', error);
      toast.error('Error al generar QR');
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
  };

  // Filtrar trabajadores
  const trabajadoresFiltrados = trabajadores.filter(t => {
    const cumpleBusqueda = !busqueda || 
      t.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.apellido_paterno?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.rut?.includes(busqueda) ||
      t.email?.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumpleEstado = !filtroEstado || 
      (filtroEstado === 'activo' && t.activo) ||
      (filtroEstado === 'inactivo' && !t.activo);
    
    return cumpleBusqueda && cumpleEstado;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con botón nuevo */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Gestión de Trabajadores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirModalNuevo}
          sx={{
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' },
            fontWeight: 'bold',
          }}
        >
          Nuevo Trabajador
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#102010' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, RUT o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} />,
              }}
              sx={{
                input: { color: 'white' },
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white' }}>Estado</InputLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                label="Estado"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activos</MenuItem>
                <MenuItem value="inactivo">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={limpiarFiltros}
              startIcon={<ClearIcon />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: '#4caf50', color: '#4caf50' },
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}>
          Total: {trabajadoresFiltrados.length} trabajadores
        </Typography>
      </Paper>

      {/* Tabla */}
      {trabajadoresFiltrados.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay trabajadores para mostrar
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3, bgcolor: '#102010' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#09320f' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sede</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo Contrato</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trabajadoresFiltrados.map((trabajador) => (
                <TableRow 
                  key={trabajador.id}
                  sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                  <TableCell sx={{ color: 'white' }}>{trabajador.rut}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {trabajador.nombre} {trabajador.apellido_paterno} {trabajador.apellido_materno}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{trabajador.sede}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{trabajador.cargo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={trabajador.tipo_contrato === 'indefinido' ? 'Indefinido' : 'Plazo Fijo'}
                      color={trabajador.tipo_contrato === 'indefinido' ? 'success' : 'warning'}
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
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => abrirModalEditar(trabajador)}
                      sx={{ color: '#3b82f6' }}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => generarQR(trabajador)}
                      sx={{ color: '#10b981' }}
                      title="Generar QR"
                    >
                      <QrIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => eliminarTrabajador(trabajador.id)}
                      sx={{ color: '#ef4444' }}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Nuevo/Editar Trabajador */}
      <Dialog
        open={modalOpen}
        onClose={cerrarModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#102010', color: 'white' } }}
      >
        <DialogTitle>
          {modoEdicion ? 'Editar Trabajador' : 'Nuevo Trabajador'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RUT"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  required
                  disabled={modoEdicion}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellido Paterno"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellido Materno"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Tipo Contrato</InputLabel>
                  <Select
                    name="tipo_contrato"
                    value={formData.tipo_contrato}
                    onChange={handleChange}
                    label="Tipo Contrato"
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '.MuiSvgIcon-root': { color: 'white' },
                    }}
                  >
                    <MenuItem value="indefinido">Indefinido</MenuItem>
                    <MenuItem value="plazo_fijo">Plazo Fijo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sede</InputLabel>
                  <Select
                    name="sede"
                    value={formData.sede}
                    onChange={handleChange}
                    label="Sede"
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '.MuiSvgIcon-root': { color: 'white' },
                    }}
                  >
                    <MenuItem value="casablanca">Casablanca</MenuItem>
                    <MenuItem value="valparaiso_bif">Valparaíso - Planta BIF</MenuItem>
                    <MenuItem value="valparaiso_bic">Valparaíso - Planta BIC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
            }}
          >
            {modoEdicion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}