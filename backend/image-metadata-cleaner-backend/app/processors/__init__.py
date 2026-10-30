"""
Metadata processors - plugin architecture for extensibility
"""
from .base import BaseProcessor
from .exif_processor import ExifProcessor
from .png_processor import PngProcessor
from .c2pa_processor import C2paProcessor
from .verdict_engine import VerdictEngine

__all__ = [
    "BaseProcessor",
    "ExifProcessor", 
    "PngProcessor",
    "C2paProcessor",
    "VerdictEngine",
]
