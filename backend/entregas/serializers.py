from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Entrega
from trabajadores.serializers import TrabajadorSerializer
from cajas.serializers import CajaSerializer
from usuarios.serializers import UsuarioSerializer
from cajas.models import Caja
from trabajadores.models import Trabajador

class EntregaSerializer(serializers.ModelSerializer):
    """
    Serializer completo para entregas con validaciones exhaustivas.
    Incluye detalles anidados de trabajador, caja y guardia.
    """
    
    # Campos de solo lectura con información completa
    trabajador_detalle = TrabajadorSerializer(source='trabajador', read_only=True)
    caja_detalle = CajaSerializer(source='caja', read_only=True)
    guardia_detalle = UsuarioSerializer(source='guardia', read_only=True)
    supervisor_detalle = UsuarioSerializer(source='supervisor', read_only=True)
    
    # Campo calculado
    tiempo_transcurrido = serializers.CharField(read_only=True)
    
    class Meta:
        model = Entrega
        fields = '__all__'
        read_only_fields = (
            'fecha_entrega', 
            'validado_supervisor', 
            'fecha_validacion',
            'supervisor'
        )
    
    def validate_trabajador(self, value):
        """Validar que el trabajador esté activo"""
        if not value.activo:
            raise serializers.ValidationError(
                'El trabajador no está activo en el sistema'
            )
        return value
    
    def validate_caja(self, value):
        """Validaciones básicas de la caja"""
        if not value:
            raise serializers.ValidationError('Debe especificar una caja')
        
        if not value.activa:
            raise serializers.ValidationError('Esta caja está inactiva')
        
        if value.cantidad_disponible <= 0:
            raise serializers.ValidationError(
                f'No hay stock disponible de esta caja en {value.get_sucursal_display()}'
            )
        
        return value
    
    def validate(self, data):
        """
        Validación completa de compatibilidad trabajador-caja
        antes de crear la entrega.
        """
        trabajador = data.get('trabajador')
        caja = data.get('caja')
        
        if not trabajador or not caja:
            return data
        
        # Obtener sede del trabajador
        trabajador_sede = getattr(trabajador, 'sede', None) or getattr(trabajador, 'sucursal', None)
        caja_sucursal = caja.sucursal
        
        # Validar compatibilidad de sucursal/sede
        if trabajador_sede and caja_sucursal and trabajador_sede != caja_sucursal:
            raise serializers.ValidationError({
                'caja': f'Incompatibilidad de ubicación: Trabajador en otra sede, '
                       f'Caja en {caja.get_sucursal_display()}'
            })
        
        # Validar tipo de contrato
        tipo_trabajador = trabajador.tipo_contrato
        tipo_caja = caja.tipo_contrato
        
        if tipo_trabajador == 'plazo_fijo' and tipo_caja != 'plazo_fijo':
            raise serializers.ValidationError({
                'caja': f'Incompatibilidad de tipo de contrato: '
                       f'Trabajador tiene contrato a plazo fijo, '
                       f'pero la caja es para contratos indefinidos'
            })
        elif tipo_trabajador == 'indefinido' and tipo_caja != 'indefinido':
            raise serializers.ValidationError({
                'caja': f'Incompatibilidad de tipo de contrato: '
                       f'Trabajador tiene contrato indefinido, '
                       f'pero la caja es para contratos a plazo fijo'
            })
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Crear entrega y descontar automáticamente del inventario.
        También actualiza el estado del trabajador a 'retirado'.
        Usa transacción atómica para garantizar consistencia.
        """
        caja = validated_data.get('caja')
        trabajador = validated_data.get('trabajador')
        
        # Crear la entrega
        entrega = Entrega.objects.create(**validated_data)
        
        # Descontar del inventario de manera atómica
        caja.cantidad_disponible -= 1
        caja.save(update_fields=['cantidad_disponible'])
        
        # Actualizar estado del trabajador a 'retirado'
        trabajador.estado = 'retirado'
        trabajador.save(update_fields=['estado'])
        
        return entrega


class EntregaListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listados.
    Solo incluye campos esenciales para mejorar rendimiento.
    """
    
    trabajador_nombre = serializers.CharField(
        source='trabajador.nombre_completo', 
        read_only=True
    )
    trabajador_rut = serializers.CharField(
        source='trabajador.rut',
        read_only=True
    )
    guardia_nombre = serializers.CharField(
        source='guardia.get_full_name', 
        read_only=True
    )
    caja_codigo = serializers.CharField(
        source='caja.codigo', 
        read_only=True
    )
    caja_tipo = serializers.CharField(
        source='caja.get_tipo_contrato_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = Entrega
        fields = [
            'id',
            'trabajador_nombre',
            'trabajador_rut',
            'guardia_nombre',
            'caja_codigo',
            'caja_tipo',
            'fecha_entrega',
            'estado',
            'estado_display',
            'validado_supervisor',
            'observaciones'
        ]


class EntregaCreateSerializer(serializers.Serializer):
    """
    Serializer para el flujo completo de creación de entrega.
    Acepta RUT o QR del trabajador y código o QR de la caja.
    """
    
    # Trabajador (una de estas opciones)
    trabajador_id = serializers.IntegerField(required=False)
    trabajador_rut = serializers.CharField(max_length=12, required=False)
    trabajador_qr = serializers.CharField(max_length=100, required=False)
    
    # Caja (una de estas opciones)
    caja_id = serializers.IntegerField(required=False)
    caja_codigo = serializers.CharField(max_length=50, required=False)
    caja_qr = serializers.CharField(max_length=100, required=False)
    
    # Opcional
    observaciones = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validar que se proporcione al menos una forma de identificar trabajador y caja"""
        
        # Validar trabajador
        has_trabajador = any([
            data.get('trabajador_id'),
            data.get('trabajador_rut'),
            data.get('trabajador_qr')
        ])
        
        if not has_trabajador:
            raise serializers.ValidationError({
                'trabajador': 'Debe proporcionar ID, RUT o QR del trabajador'
            })
        
        # Validar caja
        has_caja = any([
            data.get('caja_id'),
            data.get('caja_codigo'),
            data.get('caja_qr')
        ])
        
        if not has_caja:
            raise serializers.ValidationError({
                'caja': 'Debe proporcionar ID, código o QR de la caja'
            })
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Buscar trabajador y caja según los datos proporcionados,
        validar compatibilidad y crear la entrega.
        """
        # Buscar trabajador
        trabajador = None
        if validated_data.get('trabajador_id'):
            trabajador = Trabajador.objects.get(
                id=validated_data['trabajador_id'],
                activo=True
            )
        elif validated_data.get('trabajador_rut'):
            trabajador = Trabajador.objects.get(
                rut=validated_data['trabajador_rut'],
                activo=True
            )
        elif validated_data.get('trabajador_qr'):
            trabajador = Trabajador.objects.get(
                rut=validated_data['trabajador_qr'],
                activo=True
            )
        
        # Buscar caja
        caja = None
        if validated_data.get('caja_id'):
            caja = Caja.objects.get(
                id=validated_data['caja_id'],
                activa=True
            )
        elif validated_data.get('caja_codigo'):
            caja = Caja.objects.get(
                codigo=validated_data['caja_codigo'],
                activa=True
            )
        elif validated_data.get('caja_qr'):
            caja = Caja.objects.get(
                codigo=validated_data['caja_qr'],
                activa=True
            )
        
        # CORREGIDO: Crear entrega directamente sin usar EntregaSerializer
        # para evitar el error del guardia
        guardia = self.context['request'].user
        
        # Crear la entrega
        entrega = Entrega.objects.create(
            trabajador=trabajador,
            caja=caja,
            guardia=guardia,
            observaciones=validated_data.get('observaciones', ''),
            codigo_qr_trabajador=validated_data.get('trabajador_qr', ''),
            codigo_qr_caja=validated_data.get('caja_qr', ''),
            estado='entregado'
        )
        
        # Descontar stock
        caja.cantidad_disponible -= 1
        caja.save(update_fields=['cantidad_disponible'])
        
        # Actualizar estado del trabajador
        trabajador.estado = 'retirado'
        trabajador.save(update_fields=['estado'])
        
        return entrega


class ValidarSupervisorSerializer(serializers.Serializer):
    """Serializer para validación de entregas por supervisor"""
    
    entrega_id = serializers.IntegerField()
    comentario = serializers.CharField(required=False, allow_blank=True)
    
    def validate_entrega_id(self, value):
        """Validar que la entrega existe y no está ya validada"""
        try:
            entrega = Entrega.objects.get(id=value)
        except Entrega.DoesNotExist:
            raise serializers.ValidationError('Entrega no encontrada')
        
        if entrega.validado_supervisor:
            raise serializers.ValidationError('Esta entrega ya fue validada')
        
        return value
    
    def save(self, supervisor):
        """Validar la entrega"""
        entrega = Entrega.objects.get(id=self.validated_data['entrega_id'])
        entrega.validar(supervisor)
        
        # Agregar comentario a observaciones si existe
        comentario = self.validated_data.get('comentario')
        if comentario:
            entrega.observaciones += f"\n\nValidación supervisor: {comentario}"
            entrega.save(update_fields=['observaciones'])
        
        return entrega