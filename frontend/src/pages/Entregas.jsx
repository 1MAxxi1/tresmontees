import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
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

} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PlayArrow as ActivateIcon,
  Stop as StopIcon,
  BarChart as StatsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AREAS_OPTIONS = [
  { value: 'produccion_manufactura', label: 'Producción y Manufactura' },
  { value: 'logistica_distribucion', label: 'Logística y Distribución' },
  { value: 'administracion', label: 'Administración' },
  { value: 'rrhh', label: 'Recursos Humanos' },
  { value: 'ingenieria_practicas', label: 'Ingeniería y Prácticas' },
];

const GestionEntregas = () => {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [estadisticasDialog, setEstadisticasDialog] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    sucursal: '',
    tipo_entrega: 'general',
    areas_seleccionadas: [],
    tipo_contrato: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const steps = ['Sucursal', 'Tipo de Entrega', 'Tipo de Contrato', 'Confirmar'];

  useEffect(() => {
    cargarCampanas();
  }, []);

  const cargarCampanas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campanas/');
      setCampanas(response.data);
    } catch (error) {
      console.error('Error cargando campañas:', error);
      toast.error('Error cargando campañas');
    } finally {
      setLoading(false);
    }
  };

  const abrirWizard = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      sucursal: '',
      tipo_entrega: 'general',
      areas_seleccionadas: [],
      tipo_contrato: '',
      fecha_inicio: '',
      fecha_fin: '',
    });
    setActiveStep(0);
    setWizardOpen(true);
  };

  const cerrarWizard = () => {
    setWizardOpen(false);
    setActiveStep(0);
  };

  const handleNext = () => {
    // Validaciones por paso
    if (activeStep === 0 && !formData.sucursal) {
      toast.error('Debe seleccionar una sucursal');
      return;
    }
    if (activeStep === 1) {
      if (formData.tipo_entrega === 'grupo' && formData.areas_seleccionadas.length === 0) {
        toast.error('Debe seleccionar al menos un área');
        return;
      }
    }
    if (activeStep === 2 && !formData.tipo_contrato) {
      toast.error('Debe seleccionar un tipo de contrato');
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Validar nombre y fechas
    if (!formData.nombre.trim()) {
      toast.error('Debe ingresar un nombre para la campaña');
      return;
    }
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      toast.error('Debe ingresar las fechas de inicio y fin');
      return;
    }

    try {
      await api.post('/campanas/crear/', formData);
      toast.success('Campaña creada exitosamente');
      cerrarWizard();
      cargarCampanas();
    } catch (error) {
      console.error('Error creando campaña:', error);
      toast.error(error.response?.data?.error || 'Error creando campaña');
    }
  };

  const finalizarCampana = async (id) => {
    if (!window.confirm('¿Está seguro de que desea finalizar esta campaña?')) return;

    try {
      await api.post(`/campanas/${id}/finalizar/`);
      toast.success('Campaña finalizada correctamente');
      cargarCampanas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error finalizando campaña');
    }
  };

  const reactivarCampana = async (id) => {
    try {
      await api.post(`/campanas/${id}/reactivar/`);
      toast.success('Campaña reactivada correctamente');
      cargarCampanas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error reactivando campaña');
    }
  };

  const verEstadisticas = async (id) => {
    try {
      const response = await api.get(`/campanas/${id}/estadisticas/`);
      setEstadisticasDialog(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error cargando estadísticas');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Seleccione la Sucursal
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={formData.sucursal}
                onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
              >
                <FormControlLabel
                  value="casablanca"
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }} />}
                  label={<Typography sx={{ color: 'white' }}>Casablanca</Typography>}
                />
                <FormControlLabel
                  value="valparaiso_bif"
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }} />}
                  label={<Typography sx={{ color: 'white' }}>Valparaíso – Planta BIF</Typography>}
                />
                <FormControlLabel
                  value="valparaiso_bic"
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }} />}
                  label={<Typography sx={{ color: 'white' }}>Valparaíso – Planta BIC</Typography>}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Tipo de Entrega
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                value={formData.tipo_entrega}
                onChange={(e) => {
                  const nuevoTipo = e.target.value;
                  setFormData({
                    ...formData,
                    tipo_entrega: nuevoTipo,
                    areas_seleccionadas: nuevoTipo === 'general' ? AREAS_OPTIONS.map(a => a.value) : []
                  });
                }}
              >
                <FormControlLabel
                  value="general"
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }} />}
                  label={<Typography sx={{ color: 'white' }}>General (Todas las áreas)</Typography>}
                />
                <FormControlLabel
                  value="grupo"
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }} />}
                  label={<Typography sx={{ color: 'white' }}>Por Grupo (Seleccionar áreas)</Typography>}
                />
              </RadioGroup>
            </FormControl>

            {formData.tipo_entrega === 'grupo' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                  Seleccione las áreas:
                </Typography>
                <FormGroup>
                  {AREAS_OPTIONS.map((area) => (
                    <FormControlLabel
                      key={area.value}
                      control={
                        <Checkbox
                          checked={formData.areas_seleccionadas.includes(area.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                areas_seleccionadas: [...formData.areas_seleccionadas, area.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                areas_seleccionadas: formData.areas_seleccionadas.filter(a => a !== area.value)
                              });
                            }
                          }}
                          sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }}
                        />
                      }
                      label={<Typography sx={{ color: 'white' }}>{area.label}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </Box>
        );

      case 2:
  return (
    <Box>
      <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
        Tipo de Contrato
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
        Seleccione uno o ambos tipos de contrato:
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.tipo_contrato.includes('indefinido')}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    tipo_contrato: [...formData.tipo_contrato, 'indefinido']
                  });
                } else {
                  setFormData({
                    ...formData,
                    tipo_contrato: formData.tipo_contrato.filter(t => t !== 'indefinido')
                  });
                }
              }}
              sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }}
            />
          }
          label={<Typography sx={{ color: 'white' }}>Indefinido</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.tipo_contrato.includes('plazo_fijo')}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    tipo_contrato: [...formData.tipo_contrato, 'plazo_fijo']
                  });
                } else {
                  setFormData({
                    ...formData,
                    tipo_contrato: formData.tipo_contrato.filter(t => t !== 'plazo_fijo')
                  });
                }
              }}
              sx={{ color: 'white', '&.Mui-checked': { color: '#4caf50' } }}
            />
          }
          label={<Typography sx={{ color: 'white' }}>Plazo Fijo</Typography>}
        />
      </FormGroup>
    </Box>
  );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Confirmar Creación de Campaña
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la Campaña"
                  placeholder="Ej: Entrega Navidad 2025"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descripción (Opcional)"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Inicio"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Fin"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>
            </Grid>

            <Paper sx={{ mt: 4, p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
              <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
                📋 Resumen de la Campaña
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Sucursal:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formData.sucursal === 'casablanca' && 'Casablanca'}
                    {formData.sucursal === 'valparaiso_bif' && 'Valparaíso – Planta BIF'}
                    {formData.sucursal === 'valparaiso_bic' && 'Valparaíso – Planta BIC'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Tipo:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formData.tipo_entrega === 'general' ? 'General' : 'Por Grupo'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Áreas:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formData.tipo_entrega === 'general' ? 'Todas' : `${formData.areas_seleccionadas.length} seleccionadas`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Contrato:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formData.tipo_contrato === 'indefinido' ? 'Indefinido' : 'Plazo Fijo'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Gestión de Entregas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirWizard}
          sx={{
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          Nueva Campaña
        </Button>
      </Box>

      {/* Lista de campañas */}
      {campanas.length === 0 ? (
        <Alert severity="info">No hay campañas de entrega creadas</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#102010', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#09320f' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sucursal</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contrato</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fechas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Progreso</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campanas.map((campana) => (
                <TableRow key={campana.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <TableCell sx={{ color: 'white' }}>
                    {campana.nombre}
                    {campana.descripcion && (
                      <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)' }}>
                        {campana.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{campana.sucursal_nombre}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{campana.areas_display}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{campana.tipos_contrato_display}</TableCell>
                  <TableCell sx={{ color: 'white', fontSize: '0.875rem' }}>
                    {new Date(campana.fecha_inicio).toLocaleDateString('es-ES')} -<br />
                    {new Date(campana.fecha_fin).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={campana.esta_vigente ? 'Vigente' : (campana.activa ? 'Activa' : 'Finalizada')}
                      color={campana.esta_vigente ? 'success' : (campana.activa ? 'warning' : 'default')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {campana.entregas_realizadas} / {campana.trabajadores_elegibles}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => verEstadisticas(campana.id)}
                      sx={{ color: '#2196f3' }}
                      title="Ver estadísticas"
                    >
                      <StatsIcon />
                    </IconButton>
                    {campana.activa ? (
                      <IconButton
                        size="small"
                        onClick={() => finalizarCampana(campana.id)}
                        sx={{ color: '#f44336' }}
                        title="Finalizar"
                      >
                        <StopIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => reactivarCampana(campana.id)}
                        sx={{ color: '#4caf50' }}
                        title="Reactivar"
                      >
                        <ActivateIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Wizard */}
      <Dialog
        open={wizardOpen}
        onClose={cerrarWizard}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#102010', color: 'white' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Nueva Campaña de Entrega</Typography>
            <IconButton onClick={cerrarWizard} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: 'rgba(255,255,255,0.3)',
                      '&.Mui-active': { color: '#4caf50' },
                      '&.Mui-completed': { color: '#4caf50' },
                    }
                  }}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255,255,255,0.5)',
                      '&.Mui-active': { color: 'white' },
                      '&.Mui-completed': { color: 'rgba(255,255,255,0.7)' },
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button
            onClick={activeStep === 0 ? cerrarWizard : handleBack}
            startIcon={<BackIcon />}
            sx={{ color: 'white' }}
          >
            {activeStep === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<CheckIcon />}
              sx={{
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              Crear Campaña
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<ForwardIcon />}
              sx={{
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              Siguiente
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog Estadísticas */}
      <Dialog
        open={Boolean(estadisticasDialog)}
        onClose={() => setEstadisticasDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#102010', color: 'white' }
        }}
      >
        <DialogTitle>Estadísticas de Campaña</DialogTitle>
        <DialogContent>
          {estadisticasDialog && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
                {estadisticasDialog.campana.nombre}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3' }}>
                    <Typography variant="h4" sx={{ color: '#2196f3' }}>
                      {estadisticasDialog.trabajadores_elegibles}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Trabajadores Elegibles
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
                    <Typography variant="h4" sx={{ color: '#4caf50' }}>
                      {estadisticasDialog.entregas_realizadas}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Entregas Realizadas
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', border: '1px solid #ff9800' }}>
                    <Typography variant="h4" sx={{ color: '#ff9800' }}>
                      {estadisticasDialog.entregas_pendientes}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Pendientes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', border: '1px solid #9c27b0' }}>
                    <Typography variant="h4" sx={{ color: '#9c27b0' }}>
                      {estadisticasDialog.porcentaje_completado}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Completado
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadisticasDialog(null)} sx={{ color: 'white' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionEntregas;