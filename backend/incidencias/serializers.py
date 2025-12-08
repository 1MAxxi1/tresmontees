from rest_framework import serializers
from .models import Incidencia
from trabajadores.serializers import TrabajadorSerializer
from usuarios.serializers import UsuarioSerializer


class IncidenciaSerializer(serializers.ModelSerializer):
    """
    Serializer completo para incidencias.
    Incluye detalles del trabajador y guardia que reporta.
    """
    
    # Campos anidados de solo lectura
    trabajador_detalle = TrabajadorSerializer(source='trabajador', read_only=True)
    guardia_detalle = UsuarioSerializer(source='guardia', read_only=True)
    supervisor_detalle = UsuarioSerializer(source='supervisor', read_only=True)
    
    # Campos auxiliares
    trabajador_rut = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Campos calculados
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    tiempo_sin_resolver = serializers.SerializerMethodField()
    esta_vencida = serializers.BooleanField(read_only=True)
    
    # Emoji para UI
    emoji = serializers.SerializerMethodField()
    color_prioridad = serializers.SerializerMethodField()
    
    class Meta:
        model = Incidencia
        fields = [
            'id',
            'trabajador',
            'trabajador_detalle',
            'trabajador_rut',
            'guardia',
            'guardia_detalle',
            'supervisor',
            'supervisor_detalle',
            'entrega_relacionada',
            'tipo',
            'tipo_display',
            'emoji',
            'descripcion',
            'prioridad',
            'prioridad_display',
            'color_prioridad',
            'estado',
            'estado_display',
            'fecha_reporte',
            'fecha_resolucion',
            'solucion',
            'rut_trabajador_manual',
            'imagen_evidencia',
            'notificado',
            'tiempo_sin_resolver',
            'esta_vencida'
        ]
        read_only_fields = [
            'id', 
            'fecha_reporte', 
            'guardia', 
            'supervisor',
            'fecha_resolucion',
            'notificado',
            'prioridad'
        ]
    
    def get_emoji(self, obj):
        """Retorna emoji según tipo"""
        emojis = {
            'qr_no_funciona': '📱',
            'trabajador_no_registrado': '👤',
            'caja_danada': '📦',
            'stock_insuficiente': '⚠️',
            'trabajador_sin_beneficio': '🚫',
            'incompatibilidad_contrato': '📋',
            'sistema_caido': '🔴',
            'otro': '💬'
        }
        return emojis.get(obj.tipo, '❓')
    
    def get_color_prioridad(self, obj):
        """Retorna color según prioridad"""
        colores = {
            'critica': '#dc2626',  # Rojo
            'alta': '#ea580c',     # Naranja
            'media': '#f59e0b',    # Amarillo
            'baja': '#10b981'      # Verde
        }
        return colores.get(obj.prioridad, '#6b7280')
    
    def get_tiempo_sin_resolver(self, obj):
        """Retorna el tiempo sin resolver en formato legible"""
        tiempo = obj.tiempo_sin_resolver
        if tiempo:
            horas = tiempo.total_seconds() / 3600
            if horas < 1:
                minutos = int(tiempo.total_seconds() / 60)
                return f"{minutos} min"
            elif horas < 24:
                return f"{int(horas)}h"
            else:
                dias = int(horas / 24)
                return f"{dias}d"
        return None
    
    def create(self, validated_data):
        """
        El guardia se establece en la vista.
        Este método solo crea la incidencia con los datos validados.
        """
        return super().create(validated_data)


class IncidenciaListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listados de incidencias.
    Solo incluye campos esenciales.
    """
    
    trabajador_nombre = serializers.CharField(
        source='trabajador.nombre_completo',
        read_only=True
    )
    guardia_nombre = serializers.CharField(
        source='guardia.get_full_name',
        read_only=True
    )
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    
    class Meta:
        model = Incidencia
        fields = [
            'id',
            'trabajador_nombre',
            'guardia_nombre',
            'tipo',
            'tipo_display',
            'estado',
            'estado_display',
            'prioridad',
            'prioridad_display',
            'fecha_reporte',
            'descripcion'
        ]


class IncidenciaCreateSerializer(serializers.Serializer):
    """
    Serializer para crear incidencias desde el frontend.
    Acepta datos simples y crea la incidencia completa.
    """
    
    rut_trabajador = serializers.CharField(required=False, allow_blank=True)
    tipo = serializers.ChoiceField(
        choices=Incidencia.TIPO_CHOICES,
        default='otro'
    )
    descripcion = serializers.CharField()
    prioridad = serializers.ChoiceField(
        choices=Incidencia.PRIORIDAD_CHOICES,
        required=False
    )
    
    def validate_descripcion(self, value):
        """Validar que la descripción no esté vacía"""
        if not value.strip():
            raise serializers.ValidationError('La descripción no puede estar vacía')
        return value.strip()
    
    def create(self, validated_data):
        """Crear la incidencia con el guardia del contexto"""
        from trabajadores.models import Trabajador
        
        rut = validated_data.get('rut_trabajador', '').strip()
        
        # Buscar trabajador si se proporciona RUT
        trabajador = None
        rut_manual = None
        if rut:
            try:
                trabajador = Trabajador.objects.get(rut=rut, activo=True)
            except Trabajador.DoesNotExist:
                rut_manual = rut
        
        # Crear incidencia
        incidencia = Incidencia.objects.create(
            trabajador=trabajador,
            guardia=self.context['request'].user,
            tipo=validated_data.get('tipo', 'otro'),
            descripcion=validated_data['descripcion'],
            prioridad=validated_data.get('prioridad', 'media'),
            rut_trabajador_manual=rut_manual or '',
            estado='pendiente'
        )
        
        return incidencia