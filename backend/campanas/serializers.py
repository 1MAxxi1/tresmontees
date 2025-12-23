from rest_framework import serializers
from .models import CampanaEntrega
from trabajadores.models import Trabajador


class CampanaEntregaSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source='get_sucursal_display', read_only=True)
    tipo_entrega_nombre = serializers.CharField(source='get_tipo_entrega_display', read_only=True)
    tipos_contrato_display = serializers.SerializerMethodField()
    areas_display = serializers.SerializerMethodField()
    trabajadores_elegibles = serializers.SerializerMethodField()
    entregas_realizadas = serializers.SerializerMethodField()
    esta_vigente = serializers.BooleanField(read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = CampanaEntrega
        fields = [
            'id',
            'nombre',
            'descripcion',
            'sucursal',
            'sucursal_nombre',
            'tipo_entrega',
            'tipo_entrega_nombre',
            'areas_seleccionadas',
            'areas_display',
            'tipo_contrato',
            'tipos_contrato_display',
            'fecha_inicio',
            'fecha_fin',
            'activa',
            'esta_vigente',
            'trabajadores_elegibles',
            'entregas_realizadas',
            'creado_por',
            'creado_por_nombre',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['creado_por', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_areas_display(self, obj):
        return obj.get_areas_display()
    
    def get_tipos_contrato_display(self, obj):
        return obj.get_tipos_contrato_display()
    
    def get_trabajadores_elegibles(self, obj):
        return obj.contar_trabajadores_elegibles()
    
    def get_entregas_realizadas(self, obj):
        return obj.contar_entregas_realizadas()
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.first_name} {obj.creado_por.last_name}"
        return None
    
    def validate(self, data):
        # Validar que fecha_fin sea posterior a fecha_inicio
        if data.get('fecha_fin') and data.get('fecha_inicio'):
            if data['fecha_fin'] < data['fecha_inicio']:
                raise serializers.ValidationError({
                    'fecha_fin': 'La fecha de fin debe ser posterior a la fecha de inicio'
                })
        
        # Si es tipo general, asegurar que todas las áreas estén seleccionadas
        if data.get('tipo_entrega') == 'general':
            data['areas_seleccionadas'] = [
                'produccion_manufactura',
                'logistica_distribucion',
                'administracion',
                'rrhh',
                'ingenieria_practicas',
            ]
        
        # Si es por grupo, validar que al menos una área esté seleccionada
        if data.get('tipo_entrega') == 'grupo':
            if not data.get('areas_seleccionadas') or len(data['areas_seleccionadas']) == 0:
                raise serializers.ValidationError({
                    'areas_seleccionadas': 'Debe seleccionar al menos un área para entrega por grupo'
                })
        
        # Validar tipo_contrato (debe ser una lista con al menos un elemento)
        if data.get('tipo_contrato'):
            if not isinstance(data['tipo_contrato'], list):
                raise serializers.ValidationError({
                    'tipo_contrato': 'tipo_contrato debe ser una lista'
                })
            if len(data['tipo_contrato']) == 0:
                raise serializers.ValidationError({
                    'tipo_contrato': 'Debe seleccionar al menos un tipo de contrato'
                })
        
        return data


class CrearCampanaSerializer(serializers.Serializer):
    """Serializer simplificado para el wizard de creación"""
    nombre = serializers.CharField(max_length=200)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    sucursal = serializers.ChoiceField(choices=CampanaEntrega.SUCURSAL_CHOICES)
    tipo_entrega = serializers.ChoiceField(choices=CampanaEntrega.TIPO_ENTREGA_CHOICES)
    areas_seleccionadas = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    tipo_contrato = serializers.ListField(
        child=serializers.ChoiceField(choices=CampanaEntrega.TIPO_CONTRATO_CHOICES),
        required=True,
        allow_empty=False
    )
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField()
    
    def validate(self, data):
        # Validar fechas
        if data['fecha_fin'] < data['fecha_inicio']:
            raise serializers.ValidationError({
                'fecha_fin': 'La fecha de fin debe ser posterior a la fecha de inicio'
            })
        
        # Validar áreas según tipo de entrega
        if data['tipo_entrega'] == 'general':
            data['areas_seleccionadas'] = [
                'produccion_manufactura',
                'logistica_distribucion',
                'administracion',
                'rrhh',
                'ingenieria_practicas',
            ]
        elif data['tipo_entrega'] == 'grupo':
            if not data.get('areas_seleccionadas'):
                raise serializers.ValidationError({
                    'areas_seleccionadas': 'Debe seleccionar al menos un área'
                })
        
        # Validar tipo_contrato
        if not data.get('tipo_contrato') or len(data['tipo_contrato']) == 0:
            raise serializers.ValidationError({
                'tipo_contrato': 'Debe seleccionar al menos un tipo de contrato'
            })
        
        return data


class ValidarTrabajadorCampanaSerializer(serializers.Serializer):
    """Serializer para validar si un trabajador puede retirar en una campaña"""
    rut = serializers.CharField(max_length=12)
    
    def validate_rut(self, value):
        try:
            trabajador = Trabajador.objects.get(rut=value)
            return trabajador
        except Trabajador.DoesNotExist:
            raise serializers.ValidationError('Trabajador no encontrado')