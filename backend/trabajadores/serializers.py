from rest_framework import serializers
from .models import Trabajador


class TrabajadorSerializer(serializers.ModelSerializer):
    """
    Serializer completo para el modelo Trabajador
    """
    nombre_completo = serializers.ReadOnlyField()
    apellido_completo = serializers.ReadOnlyField()
    tipo_contrato_display = serializers.CharField(
        source='get_tipo_contrato_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = Trabajador
        fields = [
            'id',
            'rut',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'nombre_completo',
            'apellido_completo',
            'cargo',
            'tipo_contrato',
            'tipo_contrato_display',
            'periodo',
            'sede',
            'estado',
            'estado_display',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate_rut(self, value):
        """
        Validación básica de formato de RUT
        """
        if not value:
            raise serializers.ValidationError("El RUT es obligatorio")
        
        # Verificar formato básico (puede ser mejorado)
        if '-' not in value:
            raise serializers.ValidationError("El RUT debe tener formato 12345678-9")
        
        return value.upper()


class TrabajadorCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para creación de trabajadores
    """
    class Meta:
        model = Trabajador
        fields = [
            'rut',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'cargo',
            'tipo_contrato',
            'periodo',
            'sede',
            'estado',
            'activo',
        ]
    
    def validate_rut(self, value):
        """Validación de RUT"""
        if not value:
            raise serializers.ValidationError("El RUT es obligatorio")
        
        if '-' not in value:
            raise serializers.ValidationError("El RUT debe tener formato 12345678-9")
        
        return value.upper()


class TrabajadorListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados
    """
    nombre_completo = serializers.ReadOnlyField()
    tipo_contrato_display = serializers.CharField(
        source='get_tipo_contrato_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = Trabajador
        fields = [
            'id',
            'rut',
            'nombre_completo',
            'cargo',
            'tipo_contrato_display',
            'sede',
            'estado_display',
            'activo',
        ]