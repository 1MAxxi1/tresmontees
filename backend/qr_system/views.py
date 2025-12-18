import os
import uuid
import qrcode
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated

from .models import QRRegistro
from trabajadores.models import Trabajador
from .serializers import QRRegistroSerializer
from .utils import generar_hash, generar_qr_imagen


# -------------------------
# LISTAR REGISTROS QR
# -------------------------
class QRListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        registros = QRRegistro.objects.select_related("trabajador").all()
        serializer = QRRegistroSerializer(registros, many=True)
        return Response(serializer.data)


# -------------------------
# GENERAR QR INDIVIDUAL
# -------------------------
class GenerarQRView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, trabajador_id):
        trabajador = get_object_or_404(Trabajador, pk=trabajador_id)

        # Crear o actualizar registro QR
        registro, created = QRRegistro.objects.get_or_create(trabajador=trabajador)

        # Generar hash único
        registro.hash_validacion = generar_hash()
        registro.fecha_generado = timezone.now()
        registro.estado = "GENERADO"

        # Contenido del QR: ID del trabajador + Hash de validación
        contenido = f"ID:{trabajador.id}|HASH:{registro.hash_validacion}|RUT:{trabajador.rut}"
        filename = f"qr_{trabajador.id}.png"
        
        # Generar imagen QR
        ruta = generar_qr_imagen(contenido, filename)
        registro.qr_imagen = ruta
        registro.save()

        return Response({
            "message": "QR generado correctamente",
            "trabajador": f"{trabajador.nombre} {trabajador.apellido_paterno}",
            "estado": registro.estado
        }, status=status.HTTP_200_OK)


# -------------------------
# DESCARGAR QR INDIVIDUAL
# -------------------------
class DescargarQRView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, trabajador_id):
        try:
            registro = get_object_or_404(QRRegistro, trabajador_id=trabajador_id)

            if not registro.qr_imagen:
                return Response(
                    {"error": "QR no generado para este trabajador"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            return FileResponse(
                open(registro.qr_imagen.path, "rb"), 
                content_type="image/png",
                as_attachment=True,
                filename=f"qr_trabajador_{trabajador_id}.png"
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -------------------------
# ENVIAR QR POR CORREO (SIMULADO)
# -------------------------
class EnviarQREmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, trabajador_id):
        registro = get_object_or_404(QRRegistro, trabajador_id=trabajador_id)

        if not registro.qr_imagen:
            return Response(
                {"error": "Primero debe generar el QR"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simulación de envío de email
        # En producción aquí iría la lógica real de envío (SMTP, SendGrid, etc.)
        registro.fecha_enviado = timezone.now()
        registro.enviado_email = True
        registro.estado = "ENVIADO"
        registro.save()

        return Response({
            "message": "QR enviado por email (modo simulado)",
            "trabajador": f"{registro.trabajador.nombre} {registro.trabajador.apellido_paterno}",
            "estado": registro.estado
        }, status=status.HTTP_200_OK)


# -------------------------
# GENERAR QR MASIVO
# -------------------------
class GenerarQRMasivoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Obtener trabajadores activos sin QR generado
        trabajadores = Trabajador.objects.filter(activo=True)
        
        if not trabajadores.exists():
            return Response(
                {"message": "No hay trabajadores activos"}, 
                status=status.HTTP_200_OK
            )

        count = 0
        errores = 0

        # Crear carpeta si no existe
        qr_dir = os.path.join(settings.MEDIA_ROOT, "qr_codes")
        os.makedirs(qr_dir, exist_ok=True)

        for trabajador in trabajadores:
            try:
                # Crear o actualizar registro QR
                registro, created = QRRegistro.objects.get_or_create(
                    trabajador=trabajador
                )

                # Generar hash y QR
                registro.hash_validacion = generar_hash()
                registro.fecha_generado = timezone.now()
                registro.estado = "GENERADO"

                contenido = f"ID:{trabajador.id}|HASH:{registro.hash_validacion}|RUT:{trabajador.rut}"
                filename = f"qr_{trabajador.id}.png"
                
                ruta = generar_qr_imagen(contenido, filename)
                registro.qr_imagen = ruta
                registro.save()

                count += 1
            except Exception as e:
                print(f"Error generando QR para trabajador {trabajador.id}: {e}")
                errores += 1

        return Response({
            "message": f"QR generados correctamente",
            "generados": count,
            "errores": errores
        }, status=status.HTTP_200_OK)


# -------------------------
# ENVIAR QR MASIVO (SIMULADO)
# -------------------------
class EnviarQRMasivoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Obtener registros QR generados pero no enviados
        registros = QRRegistro.objects.filter(
            estado='GENERADO',
            qr_imagen__isnull=False
        )

        if not registros.exists():
            return Response(
                {"message": "No hay QR generados pendientes de envío"}, 
                status=status.HTTP_200_OK
            )

        enviados = 0

        for registro in registros:
            try:
                # Simulación de envío de email
                registro.fecha_enviado = timezone.now()
                registro.enviado_email = True
                registro.estado = "ENVIADO"
                registro.save()
                enviados += 1
            except Exception as e:
                print(f"Error enviando QR para trabajador {registro.trabajador.id}: {e}")

        return Response({
            "message": f"QR enviados por email (modo simulado)",
            "enviados": enviados
        }, status=status.HTTP_200_OK)