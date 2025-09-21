"""Custom exceptions for the AI calling agent."""

from typing import Any, Dict, Optional


class AICallingAgentException(Exception):
    """Base exception for AI calling agent."""

    def __init__(
            self,
            message: str,
            code: Optional[str] = None,
            details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code or self.__class__.__name__
        self.details = details or {}
        super().__init__(self.message)


class ConfigurationError(AICallingAgentException):
    """Raised when configuration is invalid."""
    pass


class DatabaseError(AICallingAgentException):
    """Raised when database operation fails."""
    pass


class TelephonyError(AICallingAgentException):
    """Base class for telephony-related errors."""
    pass


class TwilioError(TelephonyError):
    """Raised when Twilio API calls fail."""
    pass


class CallError(TelephonyError):
    """Raised when call operations fail."""
    pass


class CallNotFoundError(CallError):
    """Raised when call is not found."""
    pass


class CallAlreadyInProgressError(CallError):
    """Raised when trying to start a call that's already in progress."""
    pass


class InvalidCallStateError(CallError):
    """Raised when call is in invalid state for operation."""
    pass


class SessionError(AICallingAgentException):
    """Raised when session operations fail."""
    pass


class SessionNotFoundError(SessionError):
    """Raised when session is not found."""
    pass


class SessionExpiredError(SessionError):
    """Raised when session has expired."""
    pass


class STTError(AICallingAgentException):
    """Raised when Speech-to-Text operations fail."""
    pass


class TTSError(AICallingAgentException):
    """Raised when Text-to-Speech operations fail."""
    pass


class NLPError(AICallingAgentException):
    """Raised when NLP processing fails."""
    pass


class LLMError(NLPError):
    """Raised when LLM API calls fail."""
    pass


class IntegrationError(AICallingAgentException):
    """Raised when external integration fails."""
    pass


class CRMError(IntegrationError):
    """Raised when CRM integration fails."""
    pass


class ValidationError(AICallingAgentException):
    """Raised when data validation fails."""
    pass


class AuthenticationError(AICallingAgentException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(AICallingAgentException):
    """Raised when authorization fails."""
    pass


class RateLimitError(AICallingAgentException):
    """Raised when rate limit is exceeded."""
    pass


class BulkOperationError(AICallingAgentException):
    """Raised when bulk operations fail."""

    def __init__(
            self,
            message: str,
            failed_items: Optional[list] = None,
            successful_items: Optional[list] = None,
            **kwargs,
    ):
        super().__init__(message, **kwargs)
        self.failed_items = failed_items or []
        self.successful_items = successful_items or []