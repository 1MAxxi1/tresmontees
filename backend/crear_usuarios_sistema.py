import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 80)
print("CREANDO USUARIOS DEL SISTEMA")
print("=" * 80)

usuarios = [
    {
        'username': 'guardia01',
        'password': 'password123',
        'first_name': 'Pedro',
        'last_name': 'Guardia',
        'email': 'guardia01@tresmontees.com',
        'rol': 'guardia',
        'is_staff': True,
        'is_active': True,
    },
    {
        'username': 'supervisor01',
        'password': 'password123',
        'first_name': 'Carlos',
        'last_name': 'Supervisor',
        'email': 'supervisor01@tresmontees.com',
        'rol': 'supervisor',
        'is_staff': True,
        'is_active': True,
    },
    {
        'username': 'rrhh01',
        'password': 'password123',
        'first_name': 'Ana',
        'last_name': 'RRHH',
        'email': 'rrhh01@tresmontees.com',
        'rol': 'rrhh',
        'is_staff': True,
        'is_active': True,
    },
]

creados = 0
existentes = 0

for datos_usuario in usuarios:
    username = datos_usuario.pop('username')
    password = datos_usuario.pop('password')
    
    # Verificar si el usuario ya existe
    if User.objects.filter(username=username).exists():
        print(f"- Ya existe: {username}")
        existentes += 1
    else:
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            password=password,
            **datos_usuario
        )
        print(f"✓ Creado: {username} - Rol: {user.rol} - Password: password123")
        creados += 1

print("\n" + "=" * 80)
print(f"Usuarios creados: {creados}")
print(f"Usuarios existentes: {existentes}")
print(f"Total usuarios: {User.objects.count()}")
print("=" * 80)

print("\n📋 CREDENCIALES DE ACCESO:")
print("=" * 80)
print("\nGUARDIA:")
print("  Usuario: guardia01")
print("  Password: password123")
print("  Rol: guardia")

print("\nSUPERVISOR:")
print("  Usuario: supervisor01")
print("  Password: password123")
print("  Rol: supervisor")

print("\nRRHH:")
print("  Usuario: rrhh01")
print("  Password: password123")
print("  Rol: rrhh")

print("\n" + "=" * 80)
print("NOTA: También puedes acceder al admin Django con el superusuario")
print("=" * 80)