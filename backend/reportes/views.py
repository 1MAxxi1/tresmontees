from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from entregas.models import Entrega
from django.http import HttpResponse
import csv
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


class ReporteEntregaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("search", "")
        sucursal = request.query_params.get("sucursal")

        qs = Entrega.objects.select_related("trabajador", "caja", "guardia").all()

        if search:
            qs = qs.filter(
                Q(trabajador__rut__icontains=search) |
                Q(trabajador__nombre__icontains=search) |
                Q(trabajador__apellido_paterno__icontains=search)
            )

        if sucursal:
            qs = qs.filter(trabajador__sede__icontains=sucursal)

        data = []
        for e in qs:
            data.append({
                "id": str(e.id),
                "rut": e.trabajador.rut,
                "nombre": f"{e.trabajador.nombre} {e.trabajador.apellido_paterno}",
                "sucursal": e.trabajador.sede,
                "caja": e.caja.codigo if e.caja else "N/A",
                "guardia": e.guardia.username if e.guardia else "N/A",
                "fecha": e.fecha_entrega.strftime("%Y-%m-%d %H:%M")
            })

        return Response(data)


class ExportarExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Entrega.objects.select_related("trabajador", "caja", "guardia").all()

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Reporte Entregas"

        # Encabezados
        columnas = ["RUT", "Nombre", "Sucursal", "Caja", "Guardia", "Fecha"]
        ws.append(columnas)

        # Datos
        for e in qs:
            ws.append([
                e.trabajador.rut,
                f"{e.trabajador.nombre} {e.trabajador.apellido_paterno}",
                e.trabajador.sede,
                e.caja.codigo if e.caja else "N/A",
                e.guardia.username if e.guardia else "N/A",
                e.fecha_entrega.strftime("%Y-%m-%d %H:%M"),
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="reporte_entregas.xlsx"'

        wb.save(response)
        return response


class ExportarCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Entrega.objects.select_related("trabajador", "caja", "guardia").all()

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="reporte_entregas.csv"'

        writer = csv.writer(response)
        writer.writerow(["RUT", "Nombre", "Sucursal", "Caja", "Guardia", "Fecha"])

        for e in qs:
            writer.writerow([
                e.trabajador.rut,
                f"{e.trabajador.nombre} {e.trabajador.apellido_paterno}",
                e.trabajador.sede,
                e.caja.codigo if e.caja else "N/A",
                e.guardia.username if e.guardia else "N/A",
                e.fecha_entrega.strftime("%Y-%m-%d %H:%M"),
            ])

        return response


class ExportarPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Entrega.objects.select_related("trabajador", "caja", "guardia").all()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="reporte_entregas.pdf"'

        pdf = canvas.Canvas(response, pagesize=letter)
        width, height = letter

        y = height - 40
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y, "Reporte de Entregas - Tres Montes")
        y -= 30

        pdf.setFont("Helvetica", 9)

        for e in qs:
            linea = (
                f"{e.trabajador.rut} - "
                f"{e.trabajador.nombre} {e.trabajador.apellido_paterno} - "
                f"{e.trabajador.sede} - "
                f"{e.caja.codigo if e.caja else 'N/A'} - "
                f"{e.fecha_entrega.strftime('%Y-%m-%d')}"
            )
            pdf.drawString(50, y, linea)
            y -= 15

            if y < 50:
                pdf.showPage()
                y = height - 40
                pdf.setFont("Helvetica", 9)

        pdf.save()
        return response