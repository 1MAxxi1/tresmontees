import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Reportes = () => {
  
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
      
      toast.success('Reporte Excel descargado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error descargando reporte Excel');
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
      
      toast.success('Reporte PDF descargado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error descargando reporte PDF');
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
      
      toast.success('Reporte CSV descargado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error descargando reporte CSV');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Reportes de Entregas
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Exportar Reportes
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Descarga reportes de entregas en diferentes formatos
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<FileDownloadIcon />}
              onClick={exportarExcel}
              sx={{ py: 2 }}
            >
              Exportar Excel
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
              Formato .xlsx
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              startIcon={<FileDownloadIcon />}
              onClick={exportarPDF}
              sx={{ py: 2 }}
            >
              Exportar PDF
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
              Formato .pdf
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<FileDownloadIcon />}
              onClick={exportarCSV}
              sx={{ py: 2 }}
            >
              Exportar CSV
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
              Formato .csv
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información de Reportes
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            • Los reportes incluyen todas las entregas registradas en el sistema
          </Typography>
          <Typography variant="body2" paragraph>
            • Información incluida: RUT, Nombre, Sucursal, Caja, Guardia, Fecha
          </Typography>
          <Typography variant="body2" paragraph>
            • Los reportes se generan en tiempo real con la información más actualizada
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Reportes;