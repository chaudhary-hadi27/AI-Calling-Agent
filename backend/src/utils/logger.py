"""Structured logging configuration using structlog."""

import logging
import sys
from typing import Any, Dict, Optional

import structlog
from rich.console import Console
from rich.logging import RichHandler

from .config import get_settings

settings = get_settings()


def setup_logging() -> None:
    """Configure structured logging with rich formatting."""

    # Configure structlog processors based on environment
    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # Add format-specific processor
    if settings.logging.format == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))

    # Configure structlog
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    handlers = []

    if settings.logging.format != "json":
        handlers.append(
            RichHandler(
                console=Console(stderr=False),
                rich_tracebacks=True,
                tracebacks_show_locals=settings.api.debug,
            )
        )
    else:
        handlers.append(logging.StreamHandler(sys.stdout))

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.logging.level.upper()),
        handlers=handlers,
    )

    # Set specific logger levels
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.database.echo else logging.WARNING
    )


def get_logger(name: Optional[str] = None) -> structlog.stdlib.BoundLogger:
    """Get a configured logger instance."""
    return structlog.get_logger(name)


class LoggerMixin:
    """Mixin to add logging capabilities to classes."""

    @property
    def logger(self) -> structlog.stdlib.BoundLogger:
        """Get logger bound to this class."""
        return get_logger(self.__class__.__name__)


def log_function_call(func_name: str, **kwargs: Any) -> None:
    """Log function call with parameters."""
    logger = get_logger("function_calls")
    logger.info(f"Calling {func_name}", **kwargs)


def log_api_request(method: str, path: str, **extra: Any) -> None:
    """Log API request details."""
    logger = get_logger("api_requests")
    logger.info("API request", method=method, path=path, **extra)


def log_call_event(
    call_sid: str,
    event_type: str,
    status: Optional[str] = None,
    direction: Optional[str] = None,
    **extra: Any
) -> None:
    """Log telephony call events."""
    logger = get_logger("call_events")
    logger.info(
        "Call event",
        call_sid=call_sid,
        event_type=event_type,
        status=status,
        direction=direction,
        **extra
    )


def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """Log error with context."""
    logger = get_logger("errors")
    logger.error(
        "Error occurred",
        error_type=error.__class__.__name__,
        error_message=str(error),
        context=context or {},
        exc_info=True,
    )


def log_auth_event(event_type: str, email: Optional[str] = None, **extra: Any) -> None:
    """Log authentication events."""
    logger = get_logger("auth")
    logger.info("Auth event", event_type=event_type, email=email, **extra)