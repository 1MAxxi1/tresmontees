from rest_framework import serializers
from .models import Sucursal, Area


class SucursalSerializer(serializers.ModelSerializer):
    total_trabajadores = serializers.IntegerField(read_only=True)
    total_trabajadores_inactivos = serializers.IntegerField(read_only=True)
    puede_desactivarse = serializers.SerializerMethodField()
    creado_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Sucursal
        fields = [
            'id',
            'nombre',
            'codigo',
            'direccion',
            'activa',
            'total_trabajadores',
            'total_trabajadores_inactivos',
            'puede_desactivarse',
            'creado_por',
            'creado_por_nombre',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['creado_por', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_puede_desactivarse(self, obj):
        puede, mensaje = obj.puede_desactivarse
        return {
            'puede': puede,
            'mensaje': mensaje
        }
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.first_name} {obj.creado_por.last_name}".strip() or obj.creado_por.username
        return None
    
    def validate_nombre(self, value):
        # Validar que el nombre no esté vacío
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío")
        
        # Validar unicidad (excluyendo la instancia actual en caso de actualización)
        instance_id = self.instance.id if self.instance else None
        if Sucursal.objects.filter(nombre__iexact=value.strip()).exclude(id=instance_id).exists():
            raise serializers.ValidationError("Ya existe una sucursal con este nombre")
        
        return value.strip()
    
    def validate_codigo(self, value):
        # Validar que el código no esté vacío
        if not value or not value.strip():
            raise serializers.ValidationError("El código no puede estar vacío")
        
        # Convertir a minúsculas y quitar espacios
        codigo_limpio = value.strip().lower().replace(' ', '_')
        
        # Validar que solo contenga letras, números y guiones bajos
        if not codigo_limpio.replace('_', '').isalnum():
            raise serializers.ValidationError("El código solo puede contener letras, números y guiones bajos")
        
        # Validar unicidad
        instance_id = self.instance.id if self.instance else None
        if Sucursal.objects.filter(codigo__iexact=codigo_limpio).exclude(id=instance_id).exists():
            raise serializers.ValidationError("Ya existe una sucursal con este código")
        
        return codigo_limpio
    
    def validate(self, data):
        # Si se está intentando desactivar, verificar si es posible
        if 'activa' in data and not data['activa']:
            if self.instance:  # Solo validar al actualizar
                puede, mensaje = self.instance.puede_desactivarse
                if not puede:
                    raise serializers.ValidationError({
                        'activa': mensaje
                    })
        
        return data


class AreaSerializer(serializers.ModelSerializer):
    total_trabajadores = serializers.IntegerField(read_only=True)
    total_trabajadores_inactivos = serializers.IntegerField(read_only=True)
    puede_desactivarse = serializers.SerializerMethodField()
    creado_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Area
        fields = [
            'id',
            'nombre',
            'codigo',
            'descripcion',
            'activa',
            'total_trabajadores',
            'total_trabajadores_inactivos',
            'puede_desactivarse',
            'creado_por',
            'creado_por_nombre',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['creado_por', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_puede_desactivarse(self, obj):
        puede, mensaje = obj.puede_desactivarse
        return {
            'puede': puede,
            'mensaje': mensaje
        }
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.first_name} {obj.creado_por.last_name}".strip() or obj.creado_por.username
        return None
    
    def validate_nombre(self, value):
        # Validar que el nombre no esté vacío
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío")
        
        # Validar unicidad
        instance_id = self.instance.id if self.instance else None
        if Area.objects.filter(nombre__iexact=value.strip()).exclude(id=instance_id).exists():
            raise serializers.ValidationError("Ya existe un área con este nombre")
        
        return value.strip()
    
    def validate_codigo(self, value):
        # Validar que el código no esté vacío
        if not value or not value.strip():
            raise serializers.ValidationError("El código no puede estar vacío")
        
        # Convertir a minúsculas y quitar espacios
        codigo_limpio = value.strip().lower().replace(' ', '_')
        
        # Validar que solo contenga letras, números y guiones bajos
        if not codigo_limpio.replace('_', '').isalnum():
            raise serializers.ValidationError("El código solo puede contener letras, números y guiones bajos")
        
        # Validar unicidad
        instance_id = self.instance.id if self.instance else None
        if Area.objects.filter(codigo__iexact=codigo_limpio).exclude(id=instance_id).exists():
            raise serializers.ValidationError("Ya existe un área con este código")
        
        return codigo_limpio
    
    def validate(self, data):
        # Si se está intentando desactivar, verificar si es posible
        if 'activa' in data and not data['activa']:
            if self.instance:  # Solo validar al actualizar
                puede, mensaje = self.instance.puede_desactivarse
                if not puede:
                    raise serializers.ValidationError({
                        'activa': mensaje
                    })
        
        return data