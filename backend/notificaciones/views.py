from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Notificacion
from .serializers import NotificacionSerializer


class NotificacionListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Obtener últimas 50 notificaciones
        notificaciones = Notificacion.objects.all()[:50]
        serializer = NotificacionSerializer(notificaciones, many=True)
        return Response(serializer.data)


class NotificacionNoLeidasView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Contar notificaciones no leídas
        count = Notificacion.objects.filter(leido=False).count()
        return Response({"no_leidas": count})


class MarcarNotificacionLeidaView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            notificacion = Notificacion.objects.get(pk=pk)
            notificacion.leido = True
            notificacion.save()
            return Response({"status": "ok"})
        except Notificacion.DoesNotExist:
            return Response(
                {"error": "Notificación no encontrada"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class MarcarTodasLeidasView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        Notificacion.objects.filter(leido=False).update(leido=True)
        return Response({"status": "ok", "message": "Todas las notificaciones marcadas como leídas"})