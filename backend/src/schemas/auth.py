"""Authentication schemas."""

from pydantic import BaseModel


class AuthResponse(BaseModel):
    """Generic auth response."""
    success: bool
    message: str
    data: dict = None