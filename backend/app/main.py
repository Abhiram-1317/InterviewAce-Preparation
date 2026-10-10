from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import close_mongo_connection, connect_to_mongo, get_database
from app.routes.analytics import analytics_router
from app.routes.ai import ai_router
from app.routes.auth import auth_router
from app.routes.jd import jd_router
from app.routes.practice import practice_router
from app.routes.resume import resume_router
from app.routes.session import session_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager handling startup and shutdown events."""
    # Startup event: initialize MongoDB connection
    await connect_to_mongo()
    yield
    # Shutdown event: close MongoDB client connection
    await close_mongo_connection()


app = FastAPI(
    title="InterviewAce API",
    version="1.0",
    description="Backend API for InterviewAce application",
    lifespan=lifespan,
)

# CORS middleware allowing frontend URLs and development servers
allowed_origins = [settings.FRONTEND_URL]
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in allowed_origins:
    allowed_origins.append("http://127.0.0.1:3000")
if "*" not in allowed_origins:
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler catching unexpected exceptions and returning a 500 JSON response."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc)},
    )


# Include all modular routers
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(resume_router)
app.include_router(jd_router)
app.include_router(session_router)
app.include_router(practice_router)
app.include_router(analytics_router)


@app.get("/", summary="Root Welcome Endpoint")
async def root():
    """Root endpoint returning welcome message."""
    return {
        "message": "Welcome to InterviewAce API",
        "status": "online",
        "version": settings.VERSION,
    }


@app.get("/health", summary="Health Check Endpoint")
async def health_check():
    """Health check endpoint checking MongoDB connection via ping command."""
    db_status = "disconnected"
    db = get_database()
    if db is not None:
        try:
            await db.command("ping")
            db_status = "connected"
        except Exception:
            db_status = "disconnected"

    return {
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
