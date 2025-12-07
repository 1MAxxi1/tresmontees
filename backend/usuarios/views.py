from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario
from .serializers import UsuarioSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personalizado para incluir datos del usuario en el login"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar información del usuario a la respuesta
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'email': self.user.email,
            'rol': self.user.rol,
        }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada de login que incluye datos del usuario"""
    serializer_class = CustomTokenObtainPairSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class CurrentUserView(APIView):
    """Vista para obtener el usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)