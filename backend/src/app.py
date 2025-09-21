"""Main FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from .core.database import db_manager
from .core.session_manager import session_manager
from .api.routes import call as call_routes
from .api import webhooks
from .utils.config import get_settings
from .utils.logger import setup_logging, get_logger
from .utils.exceptions import AICallingAgentException

# Initialize settings and logging
settings = get_settings()
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting AI Calling Agent backend", version=settings.api.version)

    # Initialize database
    db_manager.init_db()
    logger.info("Database initialized")

    # Start session cleanup task
    await session_manager.start_session_cleanup_task()
    logger.info("Session manager started")

    # Health checks
    await perform_startup_health_checks()

    yield

    # Shutdown
    logger.info("Shutting down AI Calling Agent backend")

    # Stop session cleanup task
    await session_manager.stop_session_cleanup_task()

    # Close database connections
    await db_manager.close()

    logger.info("Shutdown complete")


async def perform_startup_health_checks():
    """Perform health checks on startup."""
    try:
        # Import services for health checks
        from .stt.openai_stt import openai_stt
        from .tts.openai_tts import openai_tts
        from .nlp.openai_nlp import openai_nlp

        # Check STT service
        stt_healthy = await openai_stt.health_check()
        logger.info("STT service health check", healthy=stt_healthy)

        # Check TTS service
        tts_healthy = await openai_tts.health_check()
        logger.info("TTS service health check", healthy=tts_healthy)

        # Check NLP service
        nlp_healthy = await openai_nlp.health_check()
        logger.info("NLP service health check", healthy=nlp_healthy)

        if not all([stt_healthy, tts_healthy, nlp_healthy]):
            logger.warning("Some services failed health checks")
        else:
            logger.info("All services passed health checks")

    except Exception as e:
        logger.error("Health check failed", error=str(e))


# Create FastAPI app
app = FastAPI(
    title=settings.api.title,
    version=settings.api.version,
    description="AI-powered calling agent for automated phone conversations",
    lifespan=lifespan,
    docs_url="/docs" if settings.api.debug else None,
    redoc_url="/redoc" if settings.api.debug else None,
)

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.api.debug else ["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.api.debug else ["yourdomain.com", "api.yourdomain.com"]
)


# Exception handlers
@app.exception_handler(AICallingAgentException)
async def handle_app_exception(request: Request, exc: AICallingAgentException):
    """Handle custom application exceptions."""
    logger.error(
        "Application exception",
        error_type=exc.__class__.__name__,
        error_message=exc.message,
        error_code=exc.code,
        path=request.url.path
    )

    status_code_mapping = {
        "CallNotFoundError": 404,
        "SessionNotFoundError": 404,
        "CallAlreadyInProgressError": 409,
        "InvalidCallStateError": 409,
        "ValidationError": 422,
        "AuthenticationError": 401,
        "AuthorizationError": 403,
        "RateLimitError": 429,
        "ConfigurationError": 500,
        "DatabaseError": 500,
        "TwilioError": 502,
        "STTError": 502,
        "TTSError": 502,
        "NLPError": 502,
        "LLMError": 502,
    }

    status_code = status_code_mapping.get(exc.code, 500)

    return JSONResponse(
        status_code=status_code,
        content={
            "error": True,
            "code": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.error("Request validation error", errors=exc.errors(), path=request.url.path)

    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": exc.errors()
        }
    )


@app.exception_handler(SQLAlchemyError)
async def handle_database_exception(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    logger.error("Database error", error=str(exc), path=request.url.path)

    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": "DATABASE_ERROR",
            "message": "Database operation failed",
            "details": {} if not settings.api.debug else {"error": str(exc)}
        }
    )


@app.exception_handler(Exception)
async def handle_unexpected_exception(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error("Unexpected error", error=str(exc), path=request.url.path, exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
            "details": {} if not settings.api.debug else {"error": str(exc)}
        }
    )


# Include routers
app.include_router(
    call_routes.router,
    prefix="/api/v1/calls",
    tags=["calls"]
)

app.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["webhooks"]
)


# Root endpoints
@app.get("/")
async def root():
    """Root endpoint with basic info."""
    return {
        "name": settings.api.title,
        "version": settings.api.version,
        "status": "running",
        "environment": settings.environment
    }


@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint."""
    try:
        # Check database connection
        async with db_manager.get_session() as session:
            await session.execute("SELECT 1")
            db_healthy = True
    except Exception:
        db_healthy = False

    # Get active sessions count
    active_sessions = session_manager.get_active_sessions_count()

    # Import and check external services
    try:
        from .stt.openai_stt import openai_stt
        from .tts.openai_tts import openai_tts
        from .nlp.openai_nlp import openai_nlp

        # Quick health checks (these should be cached/fast)
        services_status = {
            "stt": await openai_stt.health_check() if hasattr(openai_stt, 'health_check') else True,
            "tts": await openai_tts.health_check() if hasattr(openai_tts, 'health_check') else True,
            "nlp": await openai_nlp.health_check() if hasattr(openai_nlp, 'health_check') else True,
        }
    except Exception:
        services_status = {"error": "Unable to check services"}

    overall_healthy = db_healthy and all(
        status for status in services_status.values() if isinstance(status, bool)
    )

    return {
        "status": "healthy" if overall_healthy else "unhealthy",
        "timestamp": "2024-01-01T00:00:00Z",  # You'd use datetime.utcnow().isoformat()
        "database": "healthy" if db_healthy else "unhealthy",
        "services": services_status,
        "active_sessions": active_sessions,
        "version": settings.api.version
    }


@app.get("/metrics")
async def get_metrics():
    """Basic metrics endpoint for monitoring."""
    try:
        # Get session info
        active_sessions = session_manager.get_active_sessions_count()
        sessions_info = session_manager.get_active_sessions_info()

        # Calculate basic stats
        total_duration = sum(
            session.get("duration_seconds", 0)
            for session in sessions_info
        )

        return {
            "active_sessions": active_sessions,
            "total_session_duration": total_duration,
            "sessions": sessions_info,
            "uptime_seconds": 0,  # You'd calculate actual uptime
            "memory_usage_mb": 0,  # You'd get actual memory usage
        }

    except Exception as e:
        logger.error("Error getting metrics", error=str(e))
        return {
            "error": "Unable to retrieve metrics",
            "active_sessions": 0
        }


# Additional utility endpoints for development/debugging
if settings.api.debug:
    @app.get("/debug/config")
    async def debug_config():
        """Debug endpoint to view sanitized configuration."""
        config_dict = {
            "api": {
                "host": settings.api.host,
                "port": settings.api.port,
                "debug": settings.api.debug,
                "title": settings.api.title,
                "version": settings.api.version
            },
            "environment": settings.environment,
            "testing": settings.testing,
            "logging": {
                "level": settings.logging.level,
                "format": settings.logging.format
            },
            "database": {
                "echo": settings.database.echo,
                "pool_size": settings.database.pool_size,
            },
            # Don't expose sensitive data like API keys
            "external_apis": {
                "openai_configured": bool(settings.external_apis.openai_api_key),
                "elevenlabs_configured": bool(settings.external_apis.elevenlabs_api_key),
            }
        }
        return config_dict

    @app.post("/debug/test-services")
    async def test_services():
        """Debug endpoint to test all services."""
        try:
            from .stt.openai_stt import openai_stt
            from .tts.openai_tts import openai_tts
            from .nlp.openai_nlp import openai_nlp

            results = {}

            # Test TTS
            try:
                audio = await openai_tts.synthesize_speech("Hello, this is a test.")
                results["tts"] = {"status": "success", "audio_size": len(audio)}
            except Exception as e:
                results["tts"] = {"status": "error", "error": str(e)}

            # Test NLP
            try:
                response = await openai_nlp.initialize_conversation(
                    call_id="test-123",
                    context={"test": True}
                )
                results["nlp"] = {"status": "success", "response": response["text"][:100]}
            except Exception as e:
                results["nlp"] = {"status": "error", "error": str(e)}

            # Test STT would require audio data, so skip for now
            results["stt"] = {"status": "skipped", "reason": "requires audio data"}

            return results

        except Exception as e:
            return {"error": f"Test failed: {str(e)}"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=settings.api.host,
        port=settings.api.port,
        reload=settings.api.debug,
        log_level=settings.logging.level.lower(),
    )