from django.urls import path
from .views import (
    ReporteEntregaListView,
    ExportarExcelView,
    ExportarCSVView,
    ExportarPDFView
)

urlpatterns = [
    path('entregas/', ReporteEntregaListView.as_view(), name='reporte-entregas'),
    path('exportar/excel/', ExportarExcelView.as_view(), name='exportar-excel'),
    path('exportar/csv/', ExportarCSVView.as_view(), name='exportar-csv'),
    path('exportar/pdf/', ExportarPDFView.as_view(), name='exportar-pdf'),
]