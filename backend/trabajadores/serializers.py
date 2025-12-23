from rest_framework import serializers
from .models import Trabajador


class TrabajadorSerializer(serializers.ModelSerializer):
    """
    Serializer simple y funcional para Trabajador
    """
    
    class Meta:
        model = Trabajador
        fields = '__all__'  # Incluye todos los campos automáticamente
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'qr_generado', 'qr_fecha_generacion', 'qr_codigo']