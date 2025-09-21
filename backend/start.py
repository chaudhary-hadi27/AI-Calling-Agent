#!/usr/bin/env python3
"""Startup script for the AI Calling Agent backend."""

import asyncio
import sys
import os
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

import uvicorn
from src.utils.config import get_settings
from src.utils.logger import setup_logging, get_logger

# Initialize settings and logging
settings = get_settings()
setup_logging()
logger = get_logger(__name__)


async def check_dependencies():
    """Check if all required dependencies and services are available."""
    logger.info("Checking dependencies...")

    # Check database connection
    try:
        from src.core.database import db_manager
        db_manager.init_db()

        async with db_manager.get_session() as session:
            await session.execute("SELECT 1")

        logger.info("Database connection successful")
    except Exception as e:
        logger.error("Database connection failed", error=str(e))
        return False

    # Check external API keys
    missing_keys = []

    if not settings.external_apis.openai_api_key:
        missing_keys.append("OPENAI_API_KEY")

    if not settings.twilio.account_sid or not settings.twilio.auth_token:
        missing_keys.append("TWILIO credentials")

    if missing_keys:
        logger.warning("Missing API keys", missing=missing_keys)
        if settings.environment == "production":
            logger.error("Cannot start in production without required API keys")
            return False

    # Test external services (optional in development)
    if settings.environment == "production":
        try:
            from src.stt.openai_stt import openai_stt
            from src.tts.openai_tts import openai_tts
            from src.nlp.openai_nlp import openai_nlp

            # Quick health checks
            services_ok = await asyncio.gather(
                openai_stt.health_check(),
                openai_tts.health_check(),
                openai_nlp.health_check(),
                return_exceptions=True
            )

            for i, service in enumerate(['STT', 'TTS', 'NLP']):
                if isinstance(services_ok[i], Exception) or not services_ok[i]:
                    logger.warning(f"{service} service health check failed")
                else:
                    logger.info(f"{service} service healthy")

        except Exception as e:
            logger.warning("Service health checks failed", error=str(e))

    return True


def create_directories():
    """Create necessary directories."""
    directories = [
        "logs",
        "temp_audio",
        "uploads",
        "backups"
    ]

    for directory in directories:
        Path(directory).mkdir(exist_ok=True)

    logger.info("Directories created/verified")


def setup_signal_handlers():
    """Setup graceful shutdown signal handlers."""
    import signal

    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


async def main():
    """Main startup function."""
    logger.info(
        "Starting AI Calling Agent Backend",
        version=settings.api.version,
        environment=settings.environment,
        debug=settings.api.debug
    )

    # Create necessary directories
    create_directories()

    # Setup signal handlers for graceful shutdown
    setup_signal_handlers()

    # Check dependencies
    if not await check_dependencies():
        logger.error("Dependency checks failed, exiting...")
        sys.exit(1)

    # Print startup information
    logger.info(
        "Server configuration",
        host=settings.api.host,
        port=settings.api.port,
        workers=1,  # Single worker for async app
        reload=settings.api.debug
    )

    # Start the server
    config = uvicorn.Config(
        "src.app:app",
        host=settings.api.host,
        port=settings.api.port,
        reload=settings.api.debug and settings.environment == "development",
        reload_dirs=["src"] if settings.api.debug else None,
        log_level=settings.logging.level.lower(),
        access_log=settings.api.debug,
        use_colors=settings.logging.format != "json",
        loop="asyncio",
        http="auto",
        ws="auto",
        lifespan="on",
    )

    server = uvicorn.Server(config)

    try:
        logger.info("Server starting...")
        await server.serve()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error("Server error", error=str(e), exc_info=True)
        sys.exit(1)
    finally:
        logger.info("Server shutdown complete")


def run_development():
    """Run in development mode with auto-reload."""
    logger.info("Starting development server with auto-reload...")

    uvicorn.run(
        "src.app:app",
        host=settings.api.host,
        port=settings.api.port,
        reload=True,
        reload_dirs=["src"],
        log_level=settings.logging.level.lower(),
        access_log=True,
    )


def run_production():
    """Run in production mode."""
    logger.info("Starting production server...")

    # In production, you might want to use gunicorn instead
    # This is a basic uvicorn production setup
    uvicorn.run(
        "src.app:app",
        host=settings.api.host,
        port=settings.api.port,
        workers=1,  # Use 1 worker for async apps, or use gunicorn with uvicorn workers
        log_level=settings.logging.level.lower(),
        access_log=False,  # Use structured logging instead
        server_header=False,
        date_header=False,
    )


if __name__ == "__main__":
    # Parse command line arguments
    import argparse

    parser = argparse.ArgumentParser(description="AI Calling Agent Backend")
    parser.add_argument(
        "--mode",
        choices=["development", "production", "async"],
        default=settings.environment,
        help="Run mode (default: from config)"
    )
    parser.add_argument(
        "--host",
        default=settings.api.host,
        help="Host to bind to"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=settings.api.port,
        help="Port to bind to"
    )
    parser.add_argument(
        "--check-deps",
        action="store_true",
        help="Only check dependencies and exit"
    )

    args = parser.parse_args()

    # Override settings from CLI args
    if args.host != settings.api.host:
        settings.api.host = args.host
    if args.port != settings.api.port:
        settings.api.port = args.port

    try:
        if args.check_deps:
            # Just check dependencies and exit
            result = asyncio.run(check_dependencies())
            sys.exit(0 if result else 1)
        elif args.mode == "async" or settings.environment == "development":
            # Use async main for better control
            asyncio.run(main())
        elif args.mode == "development":
            run_development()
        else:
            run_production()

    except KeyboardInterrupt:
        logger.info("Startup interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error("Startup failed", error=str(e), exc_info=True)
        sys.exit(1)