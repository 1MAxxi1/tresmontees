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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Entregas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroGuardia, setFiltroGuardia] = useState('');
  const [filtroTipoCaja, setFiltroTipoCaja] = useState('');
  
  // Listas para filtros
  const [guardias, setGuardias] = useState([]);

  useEffect(() => {
    cargarEntregas();
    cargarGuardias();
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

  const cargarGuardias = async () => {
    try {
      const response = await api.get('/usuarios/');
      // Filtrar solo guardias
      const guardiasList = response.data.filter(u => u.rol === 'guardia');
      setGuardias(guardiasList);
    } catch (error) {
      console.error('Error cargando guardias:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFechaDesde('');
    setFechaHasta('');
    setFiltroGuardia('');
    setFiltroTipoCaja('');
    toast.success('Filtros limpiados');
  };

  const exportarExcel = () => {
    toast.success('Exportando a Excel... (función en desarrollo)');
    // Aquí puedes agregar la lógica para exportar a Excel
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearTipoContrato = (tipo) => {
    if (tipo === 'indefinido') return 'Indefinido';
    if (tipo === 'plazo_fijo') return 'Plazo Fijo';
    return tipo || 'N/A';
  };

  // Filtrar entregas
  const entregasFiltradas = entregas.filter(entrega => {
    // Búsqueda por texto
    const cumpleBusqueda = !busqueda || 
      entrega.trabajador?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      entrega.trabajador?.apellido_paterno?.toLowerCase().includes(busqueda.toLowerCase()) ||
      entrega.trabajador?.rut?.includes(busqueda) ||
      entrega.caja?.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      entrega.guardia?.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
      entrega.guardia?.first_name?.toLowerCase().includes(busqueda.toLowerCase());

    // Filtro por fecha desde
    const cumpleFechaDesde = !fechaDesde || 
      new Date(entrega.fecha_entrega) >= new Date(fechaDesde);

    // Filtro por fecha hasta
    const cumpleFechaHasta = !fechaHasta || 
      new Date(entrega.fecha_entrega) <= new Date(fechaHasta + 'T23:59:59');

    // Filtro por guardia
    const cumpleGuardia = !filtroGuardia || 
      entrega.guardia?.id === parseInt(filtroGuardia);

    // Filtro por tipo de caja
    const cumpleTipoCaja = !filtroTipoCaja || 
      entrega.caja?.tipo_contrato === filtroTipoCaja;

    return cumpleBusqueda && cumpleFechaDesde && cumpleFechaHasta && cumpleGuardia && cumpleTipoCaja;
  });

  // Estadísticas
  const entregasHoy = entregas.filter(e => {
    const hoy = new Date().toISOString().split('T')[0];
    return e.fecha_entrega?.startsWith(hoy);
  });

  const cajasIndefinido = entregasFiltradas.filter(e => e.caja?.tipo_contrato === 'indefinido').length;
  const cajasPlazoFijo = entregasFiltradas.filter(e => e.caja?.tipo_contrato === 'plazo_fijo').length;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          <ShippingIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Gestión de Entregas
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportarExcel}
          sx={{
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' },
            fontWeight: 'bold',
          }}
        >
          Exportar Excel
        </Button>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
          '& .Mui-selected': { color: 'white' },
        }}
      >
        <Tab label="Historial de Entregas" />
        <Tab label="Estadísticas" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {/* Panel de Filtros */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#102010' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              🔍 Filtros de Búsqueda
            </Typography>

            <Grid container spacing={2}>
              {/* Búsqueda por texto */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  placeholder="Nombre, RUT, código de caja o guardia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} />,
                  }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              {/* Fecha desde */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha Desde"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              {/* Fecha hasta */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha Hasta"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              {/* Filtro por guardia */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Guardia</InputLabel>
                  <Select
                    value={filtroGuardia}
                    onChange={(e) => setFiltroGuardia(e.target.value)}
                    label="Guardia"
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '.MuiSvgIcon-root': { color: 'white' },
                    }}
                  >
                    <MenuItem value="">Todos los guardias</MenuItem>
                    {guardias.map(guardia => (
                      <MenuItem key={guardia.id} value={guardia.id}>
                        {guardia.first_name || guardia.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro por tipo de caja */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Tipo de Caja</InputLabel>
                  <Select
                    value={filtroTipoCaja}
                    onChange={(e) => setFiltroTipoCaja(e.target.value)}
                    label="Tipo de Caja"
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '.MuiSvgIcon-root': { color: 'white' },
                    }}
                  >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    <MenuItem value="indefinido">Indefinido</MenuItem>
                    <MenuItem value="plazo_fijo">Plazo Fijo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Botón Limpiar */}
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={limpiarFiltros}
                  startIcon={<ClearIcon />}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: '#4caf50', color: '#4caf50' },
                    height: '40px',
                  }}
                >
                  Limpiar Filtros
                </Button>
              </Grid>
            </Grid>

            {/* Contador de resultados */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                📊 Total: {entregasFiltradas.length} entregas
              </Typography>
              {(busqueda || fechaDesde || fechaHasta || filtroGuardia || filtroTipoCaja) && (
                <Chip
                  label="Filtros activos"
                  color="success"
                  size="small"
                />
              )}
            </Box>
          </Paper>

          {/* Tabla de Entregas */}
          {entregasFiltradas.length === 0 ? (
            <Alert severity="info">
              No hay entregas para mostrar con los filtros aplicados
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: '#102010' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#09320f' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajador</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUT</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código Caja</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo Caja</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Guardia</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha y Hora</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entregasFiltradas.map((entrega) => (
                    <TableRow
                      key={entrega.id}
                      sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                      {/* ID */}
                      <TableCell sx={{ color: 'white' }}>{entrega.id}</TableCell>
                      
                      {/* Trabajador - Nombre Completo */}
                      <TableCell sx={{ color: 'white' }}>
                        {entrega.trabajador?.nombre} {entrega.trabajador?.apellido_paterno} {entrega.trabajador?.apellido_materno}
                      </TableCell>

                      {/* RUT */}
                      <TableCell sx={{ color: 'white' }}>
                        {entrega.trabajador?.rut || 'N/A'}
                      </TableCell>

                      {/* Código Caja */}
                      <TableCell>
                        <Chip
                          label={entrega.caja?.codigo || 'N/A'}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(147, 51, 234, 0.2)', 
                            color: '#a855f7', 
                            fontWeight: 'bold',
                            border: '1px solid rgba(147, 51, 234, 0.3)'
                          }}
                        />
                      </TableCell>

                      {/* Tipo Caja */}
                      <TableCell>
                        <Chip
                          label={formatearTipoContrato(entrega.caja?.tipo_contrato)}
                          size="small"
                          color={entrega.caja?.tipo_contrato === 'indefinido' ? 'success' : 'warning'}
                        />
                      </TableCell>

                      {/* Guardia */}
                      <TableCell sx={{ color: 'white' }}>
                        <Tooltip title={`Usuario: ${entrega.guardia?.username || 'N/A'}`}>
                          <Box>
                            {entrega.guardia?.first_name || entrega.guardia?.username || 'N/A'}
                          </Box>
                        </Tooltip>
                      </TableCell>

                      {/* Fecha y Hora */}
                      <TableCell sx={{ color: 'white' }}>
                        {formatearFecha(entrega.fecha_entrega)}
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        <Chip
                          label="Completada"
                          color="success"
                          size="small"
                        />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            sx={{ color: '#3b82f6' }}
                            onClick={() => toast.info(`Detalle de entrega #${entrega.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Resumen Total */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Total de entregas: {entregas.length}
            </Typography>
          </Box>
        </>
      )}

      {/* TAB ESTADÍSTICAS */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3, bgcolor: '#102010' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            📊 Estadísticas de Entregas
          </Typography>
          
          <Grid container spacing={3}>
            {/* Total de entregas */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a3a1a', borderTop: '4px solid #10b981' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Total de entregas
                </Typography>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                  {entregas.length}
                </Typography>
              </Paper>
            </Grid>

            {/* Entregas hoy */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a3a1a', borderTop: '4px solid #3b82f6' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Entregas hoy
                </Typography>
                <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                  {entregasHoy.length}
                </Typography>
              </Paper>
            </Grid>

            {/* Entregas esta semana */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a3a1a', borderTop: '4px solid #f59e0b' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Cajas Indefinido
                </Typography>
                <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  {cajasIndefinido}
                </Typography>
              </Paper>
            </Grid>

            {/* Cajas Plazo Fijo */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a3a1a', borderTop: '4px solid #8b5cf6' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Cajas Plazo Fijo
                </Typography>
                <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                  {cajasPlazoFijo}
                </Typography>
              </Paper>
            </Grid>

            {/* Guardias activos */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a3a1a', borderTop: '4px solid #ec4899' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Guardias registrados
                </Typography>
                <Typography variant="h3" sx={{ color: '#ec4899', fontWeight: 'bold' }}>
                  {guardias.length}
                </Typography>
              </Paper>
            </Grid>

            {/* Promedio diario */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a3a1a', borderTop: '4px solid #06b6d4' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Promedio diario
                </Typography>
                <Typography variant="h3" sx={{ color: '#06b6d4', fontWeight: 'bold' }}>
                  {entregas.length > 0 ? Math.round(entregas.length / 30) : 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Entregas;