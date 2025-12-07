#!/bin/bash

# Script de instalación automática para Tres Montees
# Ejecutar con: bash instalar.sh

echo "=============================================="
echo "  INSTALACIÓN PROYECTO TRES MONTEES"
echo "=============================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ]; then
    echo "❌ Error: No se encuentra la carpeta 'backend'"
    echo "   Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

echo "📦 Paso 1: Instalando dependencias de Python..."
cd backend
pip install -r ../requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""
echo "🗑️  Paso 2: Limpiando base de datos anterior..."
if [ -f "db.sqlite3" ]; then
    rm db.sqlite3
    echo "   ✅ Base de datos anterior eliminada"
else
    echo "   ℹ️  No había base de datos anterior"
fi

echo ""
echo "🔄 Paso 3: Creando migraciones..."
python manage.py makemigrations

if [ $? -ne 0 ]; then
    echo "❌ Error creando migraciones"
    exit 1
fi

echo ""
echo "📊 Paso 4: Aplicando migraciones..."
python manage.py migrate

if [ $? -ne 0 ]; then
    echo "❌ Error aplicando migraciones"
    exit 1
fi

echo ""
echo "👥 Paso 5: Poblando base de datos con datos de prueba..."
python populate_test_data.py

if [ $? -ne 0 ]; then
    echo "❌ Error poblando base de datos"
    exit 1
fi

echo ""
echo "=============================================="
echo "  ✅ INSTALACIÓN COMPLETADA"
echo "=============================================="
echo ""
echo "🚀 Para iniciar el servidor ejecuta:"
echo "   cd backend"
echo "   python manage.py runserver"
echo ""
echo "🔑 Credenciales de prueba:"
echo "   Usuario: guardia01"
echo "   Contraseña: password123"
echo ""
echo "📚 Revisa la documentación en docs/"
echo ""
