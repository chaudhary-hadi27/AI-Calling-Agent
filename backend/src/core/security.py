"""Security utilities for password hashing and JWT tokens."""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid

from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel

from ..utils.config import get_settings
from ..utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    """JWT token payload."""
    user_id: str
    email: str
    role: str
    iat: datetime
    exp: datetime


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
        user_id: uuid.UUID,
        email: str,
        role: str,
        expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.jwt.expiration_hours)

    expire = datetime.utcnow() + expires_delta

    to_encode = {
        "user_id": str(user_id),
        "email": email,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": expire
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt.secret_key,
        algorithm=settings.jwt.algorithm
    )

    logger.debug(f"Access token created for user {email}")

    return encoded_jwt


def verify_token(token: str) -> Optional[TokenData]:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt.secret_key,
            algorithms=[settings.jwt.algorithm]
        )

        user_id: str = payload.get("user_id")
        email: str = payload.get("email")
        role: str = payload.get("role")

        if user_id is None or email is None:
            return None

        return TokenData(
            user_id=user_id,
            email=email,
            role=role,
            iat=datetime.fromisoformat(payload.get("iat", "")),
            exp=datetime.fromisoformat(payload.get("exp", ""))
        )

    except JWTError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None