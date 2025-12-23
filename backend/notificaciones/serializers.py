from rest_framework import serializers
from .models import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.CharField(source='get_tipo_display', read_only=True)
    prioridad_nombre = serializers.CharField(source='get_prioridad_display', read_only=True)
    icono = serializers.CharField(read_only=True)
    color = serializers.CharField(read_only=True)
    tiempo_transcurrido = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = [
            'id',
            'tipo',
            'tipo_nombre',
            'titulo',
            'mensaje',
            'prioridad',
            'prioridad_nombre',
            'icono',
            'color',
            'datos_extra',
            'leida',
            'creado_en',
            'leida_en',
            'tiempo_transcurrido',
        ]
        read_only_fields = ['creado_en', 'leida_en']
    
    def get_tiempo_transcurrido(self, obj):
        """Calcula tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from datetime import timedelta
        
        ahora = timezone.now()
        diferencia = ahora - obj.creado_en
        
        if diferencia < timedelta(minutes=1):
            return 'Hace unos segundos'
        elif diferencia < timedelta(hours=1):
            minutos = int(diferencia.total_seconds() / 60)
            return f'Hace {minutos} minuto{"s" if minutos != 1 else ""}'
        elif diferencia < timedelta(days=1):
            horas = int(diferencia.total_seconds() / 3600)
            return f'Hace {horas} hora{"s" if horas != 1 else ""}'
        elif diferencia < timedelta(days=7):
            dias = diferencia.days
            return f'Hace {dias} día{"s" if dias != 1 else ""}'
        elif diferencia < timedelta(days=30):
            semanas = int(diferencia.days / 7)
            return f'Hace {semanas} semana{"s" if semanas != 1 else ""}'
        else:
            return obj.creado_en.strftime('%d/%m/%Y')


class EstadisticasNotificacionesSerializer(serializers.Serializer):
    """Serializer para estadísticas de notificaciones"""
    total = serializers.IntegerField()
    no_leidas = serializers.IntegerField()
    por_tipo = serializers.DictField()
    por_prioridad = serializers.DictField()