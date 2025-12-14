from rest_framework import serializers
from .models import Reporte, EjecucionReporte


class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'


class EjecucionReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EjecucionReporte
        fields = '__all__'