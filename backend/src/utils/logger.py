"""Structured logging configuration using structlog."""

import logging
import sys
from typing import Any, Dict

import structlog
from rich.console import Console
from rich.logging import RichHandler

from .config import get_settings

settings = get_settings()


def setup_logging() -> None:
    """Configure structured logging with rich formatting."""

    # Configure structlog
    structlog.configure(
        processors=[
            # Add file name, line number, function name to log record
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            # JSON formatting for production, pretty printing for dev
            structlog.processors.JSONRenderer() if settings.logging.format == "json"
            else structlog.dev.ConsoleRenderer(colors=True),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.logging.level.upper()),
        handlers=[
            RichHandler(
                console=Console(stderr=False),
                rich_tracebacks=True,
                tracebacks_show_locals=settings.api.debug,
            )
        ] if settings.logging.format != "json" else [],
    )

    # Set specific logger levels
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.database.echo else logging.WARNING
    )


def get_logger(name: str = None) -> structlog.stdlib.BoundLogger:
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


def log_call_event(call_sid: str, event_type: str, **extra: Any) -> None:
    """Log telephony call events."""
    logger = get_logger("call_events")
    logger.info("Call event", call_sid=call_sid, event_type=event_type, **extra)


def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    """Log error with context."""
    logger = get_logger("errors")
    logger.error(
        "Error occurred",
        error_type=error.__class__.__name__,
        error_message=str(error),
        context=context or {},
        exc_info=True,
    )