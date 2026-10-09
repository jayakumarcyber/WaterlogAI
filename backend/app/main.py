import sys
import os

# Ensure backend and root project directory are in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CivicPulse Monsoon: AI-Based Predictive Waterlogging & Drainage Risk Management Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for citizen complaint uploads
from fastapi.staticfiles import StaticFiles

uploads_candidates = [
    os.path.abspath(os.path.join(backend_dir, "data", "uploads")),
    os.path.abspath(os.path.join(root_dir, "data", "uploads")),
    "/tmp/data/uploads" if os.name != "nt" else os.path.join(os.environ.get("TEMP", "C:\\temp"), "data", "uploads")
]

uploads_dir = None
for cand in uploads_candidates:
    try:
        os.makedirs(cand, exist_ok=True)
        uploads_dir = cand
        break
    except OSError:
        continue

if uploads_dir and os.path.exists(uploads_dir):
    try:
        app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
    except Exception as e:
        print(f"[STATIC MOUNT WARNING] Could not mount /uploads: {e}")

# Root level health endpoint for convenience
@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Root Health Check",
    tags=["Health"]
)
@app.get(
    "/api/health",
    status_code=status.HTTP_200_OK,
    summary="API Health Check Alias",
    include_in_schema=False
)
async def root_health():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "configured"
    }

from fastapi import Request
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": str(exc),
            "path": request.url.path,
            "traceback": traceback.format_exc().splitlines()[-10:]
        }
    )

# Include API v1 routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse(
        content={
            "message": "Welcome to CivicPulse Monsoon API",
            "docs": "/docs",
            "health": "/health",
            "api_v1_health": f"{settings.API_V1_STR}/health"
        }
    )
