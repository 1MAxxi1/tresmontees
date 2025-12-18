from rest_framework import serializers
from incidencias.models import Incidencia
from trabajadores.models import Trabajador
from usuarios.models import Usuario


class TrabajadorSimpleSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Trabajador
        fields = ['id', 'rut', 'nombre', 'apellido_paterno', 'apellido_materno', 'nombre_completo']
    
    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido_paterno} {obj.apellido_materno}"


class GuardiaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name']


class IncidenciaSupervisorSerializer(serializers.ModelSerializer):
    trabajador = TrabajadorSimpleSerializer(read_only=True)
    guardia = GuardiaSimpleSerializer(read_only=True)
    tipo_nombre = serializers.CharField(source='get_tipo_display', read_only=True)
    prioridad_nombre = serializers.CharField(source='get_prioridad_display', read_only=True)
    
    class Meta:
        model = Incidencia
        fields = [
            'id',
            'tipo',
            'tipo_nombre',
            'descripcion',
            'prioridad',
            'prioridad_nombre',
            'estado',
            'trabajador',
            'guardia',
            'comentario_resolucion',
            'fecha_creacion',
            'fecha_actualizacion',
            'fotos'
        ]


class ActualizarIncidenciaSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=['pendiente', 'aprobado', 'rechazado'])
    comentario_resolucion = serializers.CharField(max_length=500, required=True)
    
    def validate_comentario_resolucion(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El comentario es obligatorio")
        if len(value) > 500:
            raise serializers.ValidationError("El comentario no puede exceder 500 caracteres")
        return value.strip()


class SupervisorStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pendientes = serializers.IntegerField()
    aprobados = serializers.IntegerField()
    rechazados = serializers.IntegerField()