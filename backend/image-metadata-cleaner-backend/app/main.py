"""
Image Metadata Inspector & Cleaner - FastAPI Backend

API Endpoints:
- POST /api/inspect  - Inspect image metadata and detect AI signatures
- POST /api/strip    - Strip all metadata and return clean image
- GET  /api/health   - Health check
"""
import os
import time
import io
from typing import List
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.models.schemas import InspectionResult, HealthResponse, VerdictType
from app.utils.image_utils import validate_image_file, get_image_info, load_image
from app.processors import ExifProcessor, PngProcessor, C2paProcessor, VerdictEngine

# Configuration
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "20"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Initialize processors
PROCESSORS = [
    ExifProcessor(),
    PngProcessor(),
    C2paProcessor(),
]
verdict_engine = VerdictEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print("🚀 Image Metadata Inspector API starting...")
    print(f"   Debug mode: {DEBUG}")
    print(f"   Max upload: {MAX_UPLOAD_MB}MB")
    print(f"   CORS origins: {CORS_ORIGINS}")
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="Image Metadata Inspector & Cleaner API",
    description="""
    Privacy-first API for inspecting and cleaning image metadata.

    - Detects AI generation signatures (EXIF, XMP, PNG chunks, C2PA)
    - Returns a three-state verdict (AI found / No AI / Missing)
    - Strips all metadata to create clean copies
    - Processes entirely in memory — no storage
    """,
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    max_age=600,
)

# Trusted Host Middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if DEBUG else [],  # Configure for production
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        features=[
            "exif_inspection",
            "png_chunk_inspection", 
            "c2pa_detection",
            "metadata_stripping",
        ]
    )


@app.post("/api/inspect", response_model=InspectionResult)
async def inspect_image(file: UploadFile = File(...)):
    """
    Inspect an image for metadata and AI generation signatures

    - Upload a JPEG, PNG, or WebP image
    - Returns three-state verdict and all extracted metadata
    - Processing is done entirely in memory
    """
    start_time = time.time()

    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Only images are supported."
        )

    try:
        # Read file into memory
        content = await file.read()

        # Validate
        validate_image_file(content, file.filename)

        # Load image
        image = load_image(content)

        # Get basic info
        image_info = get_image_info(content)

        # Run all processors
        all_metadata = {}
        all_signatures = []

        for processor in PROCESSORS:
            try:
                metadata = processor.extract(image, content)
                if metadata:
                    all_metadata[processor.name] = metadata

                    # Detect AI signatures
                    signatures = processor.detect_ai_signatures(metadata)
                    all_signatures.extend(signatures)
            except Exception as e:
                if DEBUG:
                    print(f"Processor {processor.name} error: {e}")
                continue

        # Determine verdict
        verdict = verdict_engine.determine_verdict(all_metadata, all_signatures)

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000

        # Convert signatures to dicts
        signatures_dict = [s.to_dict() for s in all_signatures]

        return InspectionResult(
            verdict=verdict,
            metadata=all_metadata,
            ai_signatures=signatures_dict,
            image_info=image_info,
            processing_time_ms=round(processing_time, 2),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inspection failed: {str(e)}"
        )
    finally:
        await file.close()


@app.post("/api/strip")
async def strip_metadata(file: UploadFile = File(...)):
    """
    Strip all metadata from an image and return a clean copy

    - Upload a JPEG, PNG, or WebP image
    - Returns the image with all metadata removed
    - Clean copy is generated entirely in memory
    """
    try:
        # Read file into memory
        content = await file.read()

        # Validate
        validate_image_file(content, file.filename)

        # Load image
        image = load_image(content)

        # Strip metadata using all processors
        # Use the most aggressive stripper (re-encode approach)
        clean_bytes = content

        # Try each processor's strip method
        for processor in PROCESSORS:
            try:
                clean_bytes = processor.strip(image, clean_bytes)
                # Reload image for next processor
                image = load_image(clean_bytes)
            except Exception as e:
                if DEBUG:
                    print(f"Strip processor {processor.name} error: {e}")
                continue

        # Determine output format and filename
        format_ext = {
            "JPEG": ".jpg",
            "JPG": ".jpg", 
            "PNG": ".png",
            "WEBP": ".webp",
        }.get(image.format, ".png")

        original_name = file.filename or "image"
        base_name = original_name.rsplit(".", 1)[0] if "." in original_name else original_name
        output_filename = f"{base_name}_clean{format_ext}"

        # Determine content type
        content_type = {
            "JPEG": "image/jpeg",
            "JPG": "image/jpeg",
            "PNG": "image/png", 
            "WEBP": "image/webp",
        }.get(image.format, "application/octet-stream")

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(clean_bytes),
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{output_filename}"',
                "X-Metadata-Removed": "true",
                "X-Original-Filename": original_name,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Stripping failed: {str(e)}"
        )
    finally:
        await file.close()


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    if DEBUG:
        import traceback
        detail = f"{str(exc)}\n{traceback.format_exc()}"
    else:
        detail = "An unexpected error occurred. Please try again."

    return JSONResponse(
        status_code=500,
        content={"detail": detail}
    )


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=DEBUG,
        log_level="info" if DEBUG else "warning",
    )
