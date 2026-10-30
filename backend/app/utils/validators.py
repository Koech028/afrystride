import re
from slugify import slugify


def validate_slug(name: str) -> str:
    """Generate URL-friendly slug from product/category name"""
    return slugify(name, lowercase=True, separator="-")


def validate_phone_kenya(phone: str) -> str:
    """Validate and normalize Kenyan phone number"""
    # Remove spaces, dashes, plus
    cleaned = re.sub(r'[\s\-\+]', '', phone)
    
    # Convert 07... to 2547...
    if cleaned.startswith("0") and len(cleaned) == 10:
        cleaned = "254" + cleaned[1:]
    
    # Validate format: 2547XXXXXXXX or 2541XXXXXXXX
    if not re.match(r'^254[71]\d{8}$', cleaned):
        raise ValueError("Invalid Kenyan phone number. Use format: 07XX XXX XXX or 2547XX XXX XXX")
    
    return cleaned


def validate_whatsapp_link(phone: str, message: str = "") -> str:
    """Generate WhatsApp click-to-chat link"""
    cleaned = validate_phone_kenya(phone)
    base_url = f"https://wa.me/{cleaned}"
    if message:
        from urllib.parse import quote
        base_url += f"?text={quote(message)}"
    return base_url


def sanitize_filename(filename: str) -> str:
    """Sanitize uploaded file names"""
    # Remove path traversal
    filename = filename.replace("..", "").replace("/", "").replace("\\", "")
    # Keep only safe chars
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    return filename.lower()