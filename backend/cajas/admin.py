from django.contrib import admin
from .models import Caja

@admin.register(Caja)
class CajaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'tipo_contrato', 'sucursal', 'cantidad_disponible', 'activa']
    list_filter = ['tipo_contrato', 'sucursal', 'activa']
    search_fields = ['codigo', 'sucursal']