import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ImportarTrabajadoresModal({ open, onClose, onSuccess }) {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Formato de archivo no válido. Use .xlsx, .xls o .csv');
      return;
    }

    setArchivo(file);
    setResultado(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const descargarPlantilla = () => {
    // Crear CSV con plantilla
    const headers = 'rut,nombre,apellido_paterno,apellido_materno,email,telefono,cargo,departamento,tipo_contrato,sede\n';
    const ejemplo1 = '12345678-9,Juan,Pérez,González,juan@email.com,912345678,Operario de Producción,Producción,indefinido,casablanca\n';
    const ejemplo2 = '98765432-1,María,López,Silva,maria@email.com,987654321,Supervisor de Calidad,Calidad,plazo_fijo,valparaiso_bif\n';
    const ejemplo3 = '11223344-5,Pedro,Ramírez,Torres,pedro@email.com,911223344,Jefe de Turno,Operaciones,indefinido,valparaiso_bic\n';
    
    const csvContent = headers + ejemplo1 + ejemplo2 + ejemplo3;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_trabajadores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Plantilla descargada');
  };

  const importarArchivo = async () => {
    if (!archivo) {
      toast.error('Seleccione un archivo primero');
      return;
    }

    setCargando(true);
    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const response = await api.post('/trabajadores/importar_masivo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultado(response.data);
      
      if (response.data.importados > 0) {
        toast.success(`${response.data.importados} trabajadores importados correctamente`);
        if (onSuccess) onSuccess();
      }
      
      if (response.data.errores > 0) {
        toast.warning(`${response.data.errores} filas con errores`);
      }

    } catch (error) {
      console.error('Error importando trabajadores:', error);
      toast.error(error.response?.data?.error || 'Error al importar trabajadores');
      setResultado({
        error: error.response?.data?.error || 'Error desconocido',
        importados: 0,
        errores: 0
      });
    } finally {
      setCargando(false);
    }
  };

  const cerrarModal = () => {
    setArchivo(null);
    setResultado(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={cerrarModal}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#102010', color: 'white' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Importar Trabajadores Masivamente</Typography>
        <IconButton onClick={cerrarModal} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Instrucciones */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Campos requeridos:</strong> RUT, Nombre, Apellido Paterno, Cargo, Tipo de Contrato, Sede
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Tipo de Contrato:</strong> "indefinido" o "plazo_fijo"
          </Typography>
          <Typography variant="body2">
            <strong>Sedes válidas:</strong> "casablanca", "valparaiso_bif", "valparaiso_bic"
          </Typography>
        </Alert>

        {/* Botón descargar plantilla */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={descargarPlantilla}
            sx={{
              color: '#4caf50',
              borderColor: '#4caf50',
              '&:hover': {
                borderColor: '#66bb6a',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
              },
            }}
          >
            Descargar Plantilla (CSV)
          </Button>
        </Box>

        {/* Zona de drag & drop */}
        {!resultado && (
          <Paper
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              p: 4,
              textAlign: 'center',
              border: dragActive ? '2px dashed #4caf50' : '2px dashed rgba(255,255,255,0.3)',
              bgcolor: dragActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            
            <UploadIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
            
            {archivo ? (
              <Box>
                <Typography variant="h6" sx={{ color: '#4caf50', mb: 1 }}>
                  ✓ {archivo.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {(archivo.size / 1024).toFixed(2)} KB
                </Typography>
                <Button
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setArchivo(null);
                  }}
                  sx={{ mt: 2, color: '#f44336' }}
                >
                  Remover archivo
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Arrastra tu archivo aquí
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  o haz click para seleccionar
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.5)' }}>
                  Formatos aceptados: .xlsx, .xls, .csv
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Barra de progreso */}
        {cargando && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
              Procesando archivo...
            </Typography>
          </Box>
        )}

        {/* Resultados */}
        {resultado && (
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {resultado.error ? (
                  <>
                    <ErrorIcon sx={{ color: '#f44336' }} />
                    Error en la Importación
                  </>
                ) : (
                  <>
                    <SuccessIcon sx={{ color: '#4caf50' }} />
                    Importación Completada
                  </>
                )}
              </Typography>

              {resultado.error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {resultado.error}
                </Alert>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    ✅ <strong style={{ color: '#4caf50' }}>{resultado.importados}</strong> trabajadores importados
                  </Typography>
                  {resultado.errores > 0 && (
                    <Typography variant="body1" sx={{ color: '#ff9800' }}>
                      ⚠️ <strong>{resultado.errores}</strong> filas con errores
                    </Typography>
                  )}
                </Box>
              )}

              {/* Detalles de errores */}
              {resultado.detalle_errores && resultado.detalle_errores.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#ff9800' }}>
                    Errores encontrados:
                  </Typography>
                  <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                    {resultado.detalle_errores.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`Fila ${error.fila}${error.rut ? ` (${error.rut})` : ''}`}
                          secondary={error.error}
                          primaryTypographyProps={{ sx: { color: 'white', fontSize: '0.875rem' } }}
                          secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {resultado.mas_errores && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.5)' }}>
                      ... y más errores
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={cerrarModal} sx={{ color: 'white' }}>
          {resultado ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!resultado && (
          <Button
            variant="contained"
            onClick={importarArchivo}
            disabled={!archivo || cargando}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Importar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}