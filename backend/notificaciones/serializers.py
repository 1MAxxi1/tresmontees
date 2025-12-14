from rest_framework import serializers
from .models import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    trabajador_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = '__all__'
    
    def get_trabajador_nombre(self, obj):
        if obj.trabajador:
            return f"{obj.trabajador.nombre} {obj.trabajador.apellido_paterno}"
        return "General"