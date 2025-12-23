import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Alert,
  Paper,
  Chip,
} from "@mui/material";

import {
  Download as DownloadIcon,
  Email as EmailIcon,
  QrCode2 as QrCodeIcon,
  AutoMode as AutoModeIcon,
} from "@mui/icons-material";

import api from "../api/axios";
import toast from 'react-hot-toast';

export default function QRManager() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarTrabajadores = async () => {
    setLoading(true);
    try {
      const res = await api.get("/trabajadores/");
      setTrabajadores(res.data || []);
    } catch (err) {
      console.error("Error cargando trabajadores", err);
      toast.error("Error al cargar trabajadores");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const generarQR = async (id) => {
    try {
      // ✅ URL CORRECTA
      await api.post(`/trabajadores/${id}/generar_qr/`);
      toast.success("QR generado exitosamente");
      cargarTrabajadores();
    } catch (err) {
      console.error("Error generando QR", err);
      toast.error("Error al generar QR");
    }
  };

  const descargarQR = async (id) => {
    try {
      const response = await api.get(`/qr/descargar/${id}/`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `qr_trabajador_${id}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("QR descargado exitosamente");
    } catch (err) {
      console.error("Error descargando QR", err);
      toast.error("Error al descargar QR");
    }
  };

  const enviarQR = async (id) => {
    try {
      await api.post(`/qr/enviar-email/${id}/`);
      toast.success("QR enviado por email");
      cargarTrabajadores();
    } catch (err) {
      console.error("Error enviando QR", err);
      toast.error("Error al enviar QR por email");
    }
  };

  const generarMasivo = async () => {
    try {
      // ✅ URL CORRECTA
      await api.post("/trabajadores/generar_qr_masivo/");
      toast.success("QR generados masivamente");
      cargarTrabajadores();
    } catch (err) {
      console.error("Error generando QR masivo", err);
      toast.error("Error al generar QR masivamente");
    }
  };

  const enviarMasivo = async () => {
    try {
      // ✅ URL CORRECTA
      await api.post("/trabajadores/enviar_qr_masivo/");
      toast.success("QR enviados masivamente por email");
      cargarTrabajadores();
    } catch (err) {
      console.error("Error enviando QR masivo", err);
      toast.error("Error al enviar QR masivamente");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
        <QrCodeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Gestión de Códigos QR
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Módulo de generación y gestión de códigos QR para trabajadores
      </Alert>

      <Paper sx={{ p: 3, mb: 3, bgcolor: '#102010' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Acciones Masivas
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<QrCodeIcon />}
            onClick={generarMasivo}
            size="large"
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Generar QR Masivo
          </Button>

          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={enviarMasivo}
            size="large"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: '#4caf50',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
              }
            }}
          >
            Enviar QR Masivo
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, bgcolor: '#102010' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'white' }}>
          Lista de Trabajadores
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#09320f' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trabajador</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado QR</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : trabajadores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      No hay trabajadores registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                trabajadores.map((t) => (
                  <TableRow 
                    key={t.id}
                    sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    <TableCell sx={{ color: 'white' }}>
                      {t.nombre} {t.apellido_paterno} {t.apellido_materno}
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>{t.rut}</TableCell>
                    <TableCell>
                      {/* ✅ CORREGIDO: Usar qr_generado en lugar de qr_estado */}
                      <Chip 
                        label={t.qr_generado ? "QR Generado" : "No Generado"}
                        color={t.qr_generado ? "success" : "default"}
                        size="small"
                        variant={t.qr_generado ? "filled" : "outlined"}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={() => generarQR(t.id)}
                        sx={{ color: '#10b981' }}
                        title="Generar QR"
                      >
                        <AutoModeIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => descargarQR(t.id)}
                        sx={{ color: '#3b82f6' }}
                        title="Descargar QR"
                        disabled={!t.qr_generado}
                      >
                        <DownloadIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => enviarQR(t.id)}
                        sx={{ color: '#8b5cf6' }}
                        title="Enviar por Email"
                        disabled={!t.qr_generado}
                      >
                        <EmailIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mt: 3, bgcolor: '#102010' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Funcionalidades
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong>Generar QR Individual:</strong> Genera un código QR único para un trabajador
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong>Generar QR Masivo:</strong> Genera códigos QR para todos los trabajadores
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong>Descargar QR:</strong> Descarga la imagen del código QR
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong>Enviar por Email:</strong> Envía el código QR al correo del trabajador
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <strong>Enviar Masivo:</strong> Envía códigos QR a todos los trabajadores por email
            </Typography>
          </li>
        </Box>
      </Paper>
    </Box>
  );
}