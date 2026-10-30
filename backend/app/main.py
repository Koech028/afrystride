import asyncio
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import connect_db, close_db
from app.api.v1.router import api_router
from app.core.rate_limiter import limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.v1.seo import router as seo_router


settings = get_settings()


async def keep_alive():
    """Ping self every 10 minutes to prevent Render free tier from sleeping."""
    if not settings.SELF_URL:
        return

    await asyncio.sleep(30)
    async with httpx.AsyncClient() as client:
        while True:
            try:
                await client.get(f"{settings.SELF_URL}/health", timeout=10)
            except Exception:
                pass
            await asyncio.sleep(600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    task = asyncio.create_task(keep_alive())
    yield
    task.cancel()
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    description="AfryStride Sportswear API - Phase 1",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Host header check — the API itself is only ever reached via the Render URL,
# NOT the frontend's custom domain. These must match, or every request gets a 400.
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["afrystride.onrender.com"],
    )

# CORS — which frontend origins are allowed to call this API
origins = ["*"] if settings.DEBUG else [o.strip() for o in settings.FRONTEND_URL.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(seo_router)


@app.get("/")
async def root():
    return {
        "message": "AfryStride API",
        "version": "1.0.0",
        "phase": "Phase 1",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}