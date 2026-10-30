"""
Pydantic models for API request/response schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class VerdictType(str, Enum):
    AI_FOUND = "ai_signature_found"
    NO_AI = "no_ai_metadata_detected"
    MISSING = "metadata_missing_or_stripped"


class ImageInfo(BaseModel):
    width: int
    height: int
    format: str
    mode: str
    size_bytes: int


class AISignature(BaseModel):
    type: str = Field(..., description="Type of AI signature detected")
    detail: str = Field(..., description="Details about the signature")
    confidence: Optional[str] = Field(None, description="Confidence level if available")


class InspectionResult(BaseModel):
    verdict: VerdictType = Field(..., description="Three-state verdict")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="All extracted metadata")
    ai_signatures: List[AISignature] = Field(default_factory=list, description="Detected AI signatures")
    image_info: ImageInfo = Field(..., description="Basic image information")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    features: List[str] = Field(default_factory=list)
