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
      await api.post(`/qr/generar/${id}/`);
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
      await api.post("/qr/generar-masivo/");
      toast.success("QR generados masivamente");
      cargarTrabajadores();
    } catch (err) {
      console.error("Error generando QR masivo", err);
      toast.error("Error al generar QR masivamente");
    }
  };

  const enviarMasivo = async () => {
    try {
      await api.post("/qr/enviar-masivo/");
      toast.success("QR enviados masivamente por email");
      cargarTrabajadores();
    } catch (err) {
      console.error("Error enviando QR masivo", err);
      toast.error("Error al enviar QR masivamente");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <QrCodeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Gestión de Códigos QR
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Módulo de generación y gestión de códigos QR para trabajadores
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Acciones Masivas
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<QrCodeIcon />}
            onClick={generarMasivo}
            size="large"
          >
            Generar QR Masivo
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<EmailIcon />}
            onClick={enviarMasivo}
            size="large"
          >
            Enviar QR Masivo
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Lista de Trabajadores
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
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
                    <Typography color="textSecondary">
                      No hay trabajadores registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                trabajadores.map((t) => (
                  <TableRow 
                    key={t.id}
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      {t.nombre} {t.apellido_paterno} {t.apellido_materno}
                    </TableCell>
                    <TableCell>{t.rut}</TableCell>
                    <TableCell>
                      <Chip 
                        label={t.qr_estado || "NO GENERADO"}
                        color={
                          t.qr_estado === "ENVIADO" ? "success" :
                          t.qr_estado === "GENERADO" ? "primary" :
                          "default"
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={() => generarQR(t.id)}
                        color="primary"
                        title="Generar QR"
                      >
                        <AutoModeIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => descargarQR(t.id)}
                        color="success"
                        title="Descargar QR"
                      >
                        <DownloadIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => enviarQR(t.id)}
                        color="secondary"
                        title="Enviar por Email"
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

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Funcionalidades
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Generar QR Individual:</strong> Genera un código QR único para un trabajador
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Generar QR Masivo:</strong> Genera códigos QR para todos los trabajadores
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Descargar QR:</strong> Descarga la imagen del código QR
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Enviar por Email:</strong> Envía el código QR al correo del trabajador
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Enviar Masivo:</strong> Envía códigos QR a todos los trabajadores por email
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Estados:</strong> No generado, Generado, Enviado
            </Typography>
          </li>
        </Box>
      </Paper>
    </Box>
  );
}