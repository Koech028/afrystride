"""
Abstract base class for all metadata processors
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from PIL import Image as PILImage


class AISignature:
    """Represents a detected AI signature"""
    def __init__(self, type: str, detail: str, confidence: str = None):
        self.type = type
        self.detail = detail
        self.confidence = confidence

    def to_dict(self) -> dict:
        result = {"type": self.type, "detail": self.detail}
        if self.confidence:
            result["confidence"] = self.confidence
        return result


class BaseProcessor(ABC):
    """
    Abstract base class for metadata processors.
    All processors must implement this interface.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Processor name/identifier"""
        pass

    @abstractmethod
    def extract(self, image: PILImage.Image, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Extract metadata from image

        Args:
            image: PIL Image object
            raw_bytes: Raw image bytes

        Returns:
            Dictionary of extracted metadata
        """
        pass

    @abstractmethod
    def detect_ai_signatures(self, metadata: Dict[str, Any]) -> List[AISignature]:
        """
        Detect AI generation signatures in extracted metadata

        Args:
            metadata: Metadata extracted by this processor

        Returns:
            List of detected AI signatures
        """
        pass

    def strip(self, image: PILImage.Image, raw_bytes: bytes) -> bytes:
        """
        Strip metadata from image. Default implementation saves without metadata.
        Override for format-specific handling.

        Args:
            image: PIL Image object
            raw_bytes: Raw image bytes

        Returns:
            Clean image bytes
        """
        import io
        output = io.BytesIO()
        # Save without EXIF by default
        image.save(output, format=image.format, exif=b"")
        return output.getvalue()
