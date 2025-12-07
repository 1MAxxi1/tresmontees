from rest_framework import serializers
from .models import Incidencia
from trabajadores.serializers import TrabajadorSerializer
from usuarios.serializers import UsuarioSerializer


class IncidenciaSerializer(serializers.ModelSerializer):
    trabajador_detalle = TrabajadorSerializer(source='trabajador', read_only=True)
    reportado_por_detalle = UsuarioSerializer(source='reportado_por', read_only=True)
    trabajador_rut = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Incidencia
        fields = [
            'id',
            'trabajador',
            'trabajador_detalle',
            'trabajador_rut',
            'descripcion',
            'fecha_reporte',
            'reportado_por',
            'reportado_por_detalle',
            'estado',
            'fecha_resolucion',
            'resolucion'
        ]
        read_only_fields = ['id', 'fecha_reporte', 'reportado_por']
    
    def create(self, validated_data):
        # El reportado_por se establece en la vista
        return super().create(validated_data)