from django.contrib import admin
from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'trabajador', 'tipo', 'leido', 'creado_en']
    list_filter = ['tipo', 'leido', 'creado_en']
    search_fields = ['titulo', 'mensaje']
    date_hierarchy = 'creado_en'