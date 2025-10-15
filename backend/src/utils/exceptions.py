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


# ============================================
# CONFIGURATION & SYSTEM ERRORS
# ============================================

class ConfigurationError(AICallingAgentException):
    """Raised when configuration is invalid."""
    pass


class DatabaseError(AICallingAgentException):
    """Raised when database operation fails."""
    pass


# ============================================
# AUTHENTICATION & AUTHORIZATION
# ============================================

class AuthenticationError(AICallingAgentException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(AICallingAgentException):
    """Raised when authorization fails."""
    pass


class InvalidCredentialsError(AuthenticationError):
    """Raised when login credentials are invalid."""
    pass


class TokenExpiredError(AuthenticationError):
    """Raised when JWT token has expired."""
    pass


class InvalidTokenError(AuthenticationError):
    """Raised when JWT token is invalid."""
    pass


# ============================================
# USER MANAGEMENT
# ============================================

class UserError(AICallingAgentException):
    """Base exception for user-related errors."""
    pass


class UserNotFoundError(UserError):
    """Raised when user is not found."""
    pass


class UserAlreadyExistsError(UserError):
    """Raised when trying to create a user that already exists."""
    pass


class UserInactiveError(UserError):
    """Raised when user account is inactive."""
    pass


# ============================================
# TELEPHONY ERRORS
# ============================================

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


# ============================================
# SESSION MANAGEMENT
# ============================================

class SessionError(AICallingAgentException):
    """Raised when session operations fail."""
    pass


class SessionNotFoundError(SessionError):
    """Raised when session is not found."""
    pass


class SessionExpiredError(SessionError):
    """Raised when session has expired."""
    pass


# ============================================
# AI SERVICES (STT, TTS, NLP)
# ============================================

class AIServiceError(AICallingAgentException):
    """Base class for AI service errors."""
    pass


class STTError(AIServiceError):
    """Raised when Speech-to-Text operations fail."""
    pass


class TTSError(AIServiceError):
    """Raised when Text-to-Speech operations fail."""
    pass


class NLPError(AIServiceError):
    """Raised when NLP processing fails."""
    pass


class LLMError(NLPError):
    """Raised when LLM API calls fail."""
    pass


# ============================================
# INTEGRATION ERRORS
# ============================================

class IntegrationError(AICallingAgentException):
    """Raised when external integration fails."""
    pass


class CRMError(IntegrationError):
    """Raised when CRM integration fails."""
    pass


# ============================================
# VALIDATION & DATA ERRORS
# ============================================

class ValidationError(AICallingAgentException):
    """Raised when data validation fails."""
    pass


class DataFormatError(ValidationError):
    """Raised when data format is invalid."""
    pass


class MissingDataError(ValidationError):
    """Raised when required data is missing."""
    pass


# ============================================
# RATE LIMITING
# ============================================

class RateLimitError(AICallingAgentException):
    """Raised when rate limit is exceeded."""
    pass


# ============================================
# BULK OPERATIONS
# ============================================

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