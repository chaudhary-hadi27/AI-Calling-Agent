"""CSRF Protection Middleware."""

from fastapi import Request, HTTPException, status
from fastapi.responses import Response
import secrets
import hmac
import hashlib

from ..utils.config import get_settings
from ..utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

CSRF_TOKEN_LENGTH = 32
CSRF_COOKIE_NAME = "csrf-token"
CSRF_HEADER_NAME = "X-CSRF-Token"


class CSRFProtection:
    """CSRF Protection middleware."""

    def __init__(self):
        self.secret_key = settings.csrf_secret_key.encode()

    def generate_token(self) -> str:
        """Generate new CSRF token."""
        return secrets.token_urlsafe(CSRF_TOKEN_LENGTH)

    def create_signature(self, token: str) -> str:
        """Create HMAC signature for token."""
        return hmac.new(
            self.secret_key,
            token.encode(),
            hashlib.sha256
        ).hexdigest()

    def verify_token(self, token: str, signature: str) -> bool:
        """Verify CSRF token signature."""
        expected_signature = self.create_signature(token)
        return hmac.compare_digest(expected_signature, signature)

    def set_csrf_cookie(self, response: Response, token: str) -> None:
        """Set CSRF token in cookie."""
        signature = self.create_signature(token)

        response.set_cookie(
            key=CSRF_COOKIE_NAME,
            value=f"{token}.{signature}",
            httponly=False,  # Frontend needs to read this
            secure=settings.environment == "production",
            samesite="strict",
            max_age=3600  # 1 hour
        )


csrf_protection = CSRFProtection()


async def csrf_middleware(request: Request, call_next):
    """CSRF protection middleware."""

    # Skip CSRF for safe methods and specific paths
    if request.method in ["GET", "HEAD", "OPTIONS"] or request.url.path.startswith("/docs"):
        response = await call_next(request)

        # Generate and set CSRF token for GET requests
        if request.method == "GET" and not request.url.path.startswith("/docs"):
            token = csrf_protection.generate_token()
            csrf_protection.set_csrf_cookie(response, token)

        return response

    # Skip CSRF for auth endpoints (optional - you can enable if needed)
    if "/api/auth/" in request.url.path:
        response = await call_next(request)
        return response

    # Validate CSRF for unsafe methods
    csrf_header = request.headers.get(CSRF_HEADER_NAME)
    csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)

    if not csrf_cookie or not csrf_header:
        logger.warning("Missing CSRF token", path=request.url.path, method=request.method)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing"
        )

    # Parse cookie
    try:
        token, signature = csrf_cookie.split(".", 1)
    except ValueError:
        logger.warning("Invalid CSRF format", path=request.url.path)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token format"
        )

    # Verify signature
    if not csrf_protection.verify_token(token, signature):
        logger.warning("Invalid CSRF signature", path=request.url.path)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token"
        )

    # Verify header matches cookie
    if not hmac.compare_digest(csrf_header, token):
        logger.warning("CSRF token mismatch", path=request.url.path)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token mismatch"
        )

    response = await call_next(request)
    return response