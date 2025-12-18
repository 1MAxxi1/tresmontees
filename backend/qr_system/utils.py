import qrcode
import hashlib
import uuid
from django.conf import settings
import os


def generar_hash():
    """Genera un hash único para validación del QR"""
    return hashlib.sha256(uuid.uuid4().hex.encode()).hexdigest()


def generar_qr_imagen(texto, filename):
    """
    Genera una imagen QR y la guarda en MEDIA_ROOT/qr_codes/
    
    Args:
        texto: Contenido a codificar en el QR
        filename: Nombre del archivo (ej: qr_123.png)
    
    Returns:
        Ruta relativa para guardar en el campo ImageField
    """
    img = qrcode.make(texto)

    output_path = os.path.join(settings.MEDIA_ROOT, "qr_codes")
    os.makedirs(output_path, exist_ok=True)

    full_path = os.path.join(output_path, filename)
    img.save(full_path)
    
    return f"qr_codes/{filename}"