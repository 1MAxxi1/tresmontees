from rest_framework import serializers
from .models import QRRegistro
from trabajadores.models import Trabajador


class QRTrabajadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trabajador
        fields = [
            "id", "rut", "nombre", "apellido_paterno", "apellido_materno",
            "sede", "tipo_contrato", "activo"
        ]


class QRRegistroSerializer(serializers.ModelSerializer):
    trabajador = QRTrabajadorSerializer(read_only=True)
    qr_estado = serializers.CharField(source='estado', read_only=True)
    
    class Meta:
        model = QRRegistro
        fields = "__all__"