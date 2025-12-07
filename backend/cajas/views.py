from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Caja
from .serializers import CajaSerializer

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer
    permission_classes = [IsAuthenticated]