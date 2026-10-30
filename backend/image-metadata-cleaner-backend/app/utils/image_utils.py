"""
Image utility functions for loading, validating, and basic info extraction
"""
import io
from typing import Tuple, Optional
from PIL import Image as PILImage
from PIL.ExifTags import TAGS


# Supported image formats
SUPPORTED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
SUPPORTED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB = 20
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


class ImageValidationError(Exception):
    """Raised when image validation fails"""
    pass


def validate_image_file(content: bytes, filename: str) -> None:
    """
    Validate uploaded image file

    Args:
        content: Raw file bytes
        filename: Original filename

    Raises:
        ImageValidationError: If validation fails
    """
    # Check file size
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise ImageValidationError(
            f"File too large: {len(content) / 1024 / 1024:.1f}MB. "
            f"Maximum size is {MAX_FILE_SIZE_MB}MB."
        )

    # Check if we can open it as an image
    try:
        img = PILImage.open(io.BytesIO(content))
        img.verify()  # Verify it's a valid image
    except Exception as e:
        raise ImageValidationError(f"Invalid image file: {str(e)}")

    # Check format
    img = PILImage.open(io.BytesIO(content))  # Re-open after verify
    if img.format not in SUPPORTED_FORMATS:
        raise ImageValidationError(
            f"Unsupported format: {img.format}. "
            f"Supported: {', '.join(SUPPORTED_FORMATS)}"
        )


def get_image_info(content: bytes) -> dict:
    """
    Get basic image information

    Args:
        content: Raw image bytes

    Returns:
        Dict with width, height, format, mode, size_bytes
    """
    img = PILImage.open(io.BytesIO(content))
    return {
        "width": img.width,
        "height": img.height,
        "format": img.format,
        "mode": img.mode,
        "size_bytes": len(content),
    }


def load_image(content: bytes) -> PILImage.Image:
    """Load image from bytes"""
    return PILImage.open(io.BytesIO(content))
