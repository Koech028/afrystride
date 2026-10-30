# Image Metadata Inspector & Cleaner — Backend

FastAPI backend for inspecting and stripping image metadata with AI signature detection.

## Features

- **EXIF/XMP/IPTC Extraction** — Full metadata parsing via Pillow + piexif
- **PNG Text Chunks** — Detects Stable Diffusion/Automatic1111 parameters
- **C2PA Detection** — Content Credentials manifest detection
- **Three-State Verdict** — AI found / No AI / Missing metadata
- **In-Memory Processing** — No files stored, privacy-first
- **Plugin Architecture** — Easy to add new processors

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
python run.py --reload

# Or with uvicorn directly
uvicorn app.main:app --reload --port 8000
```

API will be at `http://localhost:8000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/inspect` | Inspect image metadata |
| POST | `/api/strip` | Strip metadata, download clean image |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `DEBUG` | `false` | Debug mode (enables docs, verbose logs) |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `MAX_UPLOAD_MB` | `20` | Maximum upload size in MB |

## Project Structure

```
app/
├── __init__.py
├── main.py              # FastAPI app, routes, middleware
├── models/
│   ├── __init__.py
│   └── schemas.py       # Pydantic models
├── processors/
│   ├── __init__.py
│   ├── base.py          # Abstract base class
│   ├── exif_processor.py   # EXIF/XMP/IPTC
│   ├── png_processor.py    # PNG text chunks
│   ├── c2pa_processor.py   # C2PA manifests
│   └── verdict_engine.py   # Three-state verdict logic
└── utils/
    ├── __init__.py
    └── image_utils.py   # Validation, loading, info extraction
```

## Adding a New Processor

1. Create a new file in `app/processors/`
2. Inherit from `BaseProcessor`
3. Implement `extract()`, `detect_ai_signatures()`, and optionally `strip()`
4. Register in `app/main.py` PROCESSORS list

## Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Inspect an image
curl -X POST -F "file=@test.jpg" http://localhost:8000/api/inspect

# Strip metadata
curl -X POST -F "file=@test.jpg" -o test_clean.jpg http://localhost:8000/api/strip
```
