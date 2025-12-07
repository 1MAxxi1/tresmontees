from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROLES = [
        ('guardia', 'Guardia'),
        ('supervisor', 'Supervisor'),
        ('rrhh', 'Recursos Humanos'),
    ]
    
    rol = models.CharField(max_length=20, choices=ROLES, verbose_name='Rol')
    telefono = models.CharField(max_length=15, blank=True, verbose_name='Teléfono')
    
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='usuario_set',
        related_query_name='usuario',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='usuario_set',
        related_query_name='usuario',
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"