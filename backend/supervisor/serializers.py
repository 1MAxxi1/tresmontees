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
            'solucion',
            'fecha_reporte',
            'fecha_resolucion',
            'imagen_evidencia'
        ]


class ActualizarIncidenciaSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=['pendiente', 'aprobado', 'rechazado', 'resuelto', 'en_proceso'])
    solucion = serializers.CharField(max_length=500, required=False, allow_blank=True)
    comentario_resolucion = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate(self, data):
        # Aceptar cualquiera de los dos nombres de campo
        solucion = data.get('solucion') or data.get('comentario_resolucion')
        
        if not solucion or not solucion.strip():
            raise serializers.ValidationError({"solucion": "El comentario es obligatorio"})
        
        if len(solucion) > 500:
            raise serializers.ValidationError({"solucion": "El comentario no puede exceder 500 caracteres"})
        
        # Siempre usar 'solucion' como nombre final
        data['solucion'] = solucion.strip()
        
        # Eliminar comentario_resolucion si existe
        data.pop('comentario_resolucion', None)
        
        return data


class SupervisorStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pendientes = serializers.IntegerField()
    aprobados = serializers.IntegerField()
    rechazados = serializers.IntegerField()