"""User service for database operations."""

import uuid
from typing import Optional
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .email_service import email_service
from ..core.database import User, UserRole
from ..core.security import hash_password, verify_password
from ..schemas.user import UserCreate
from ..utils.logger import get_logger
from ..utils.exceptions import UserAlreadyExistsError, UserNotFoundError, InvalidCredentialsError

logger = get_logger(__name__)


class UserService:
    """Service for user operations."""

    async def create_user(self, session: AsyncSession, user_data: UserCreate) -> tuple[User, str]:
        """Create new user and send verification code."""

        # Check if user exists
        existing = await session.scalar(
            select(User).where(User.email == user_data.email)
        )

        if existing:
            raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")

        # Generate verification code
        verification_code = email_service.generate_verification_code()

        # Create user
        user = User(
            id=uuid.uuid4(),
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            password_hash=hash_password(user_data.password),
            role=UserRole.USER,
            is_active=False,  # ✅ Inactive until verified
            is_verified=False,
            verification_code=verification_code,
            verification_code_expires=datetime.utcnow() + timedelta(minutes=10)  # 10 min expiry
        )

        session.add(user)
        await session.commit()
        await session.refresh(user)

        # ✅ Send verification email
        email_sent = await email_service.send_verification_code(
            email=user.email,
            code=verification_code,
            user_name=user.full_name
        )

        if not email_sent:
            logger.warning("Failed to send verification email", email=user.email)

        logger.info("User created", email=user.email, user_id=str(user.id))

        return user, verification_code

    async def verify_email(self, session: AsyncSession, email: str, code: str) -> bool:
        """Verify email with code."""
        user = await session.scalar(
            select(User).where(User.email == email)
        )

        if not user:
            raise InvalidCredentialsError("User not found")

        # Check if already verified
        if user.is_verified:
            raise InvalidCredentialsError("Email already verified")

        # Check if code matches
        if user.verification_code != code:
            raise InvalidCredentialsError("Invalid verification code")

        # Check if code expired
        if user.verification_code_expires < datetime.utcnow():
            raise InvalidCredentialsError("Verification code expired. Please request a new one.")

        # Activate user
        user.is_verified = True
        user.is_active = True
        user.verification_code = None
        user.verification_code_expires = None

        await session.commit()

        logger.info("Email verified", email=user.email)

        # Send welcome email
        await email_service.send_welcome_email(user.email, user.full_name or "there")

        return True

    async def get_user_by_email(
            self,
            session: AsyncSession,
            email: str
    ) -> Optional[User]:
        """Get user by email."""
        query = select(User).where(User.email == email)
        result = await session.execute(query)
        return result.scalar()

    async def get_user_by_id(
            self,
            session: AsyncSession,
            user_id: uuid.UUID
    ) -> Optional[User]:
        """Get user by ID."""
        query = select(User).where(User.id == user_id)
        result = await session.execute(query)
        return result.scalar()

    async def authenticate_user(
            self,
            session: AsyncSession,
            email: str,
            password: str
    ) -> User:
        """Authenticate user with email and password."""

        user = await self.get_user_by_email(session, email)
        if not user:
            raise InvalidCredentialsError("Invalid email or password")

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsError("Invalid email or password")

        if not user.is_active:
            raise InvalidCredentialsError("User account is inactive")

        logger.info(f"User authenticated: {email}")
        return user

    async def update_last_login(
            self,
            session: AsyncSession,
            user_id: uuid.UUID
    ) -> None:
        """Update user's last login timestamp."""
        user = await self.get_user_by_id(session, user_id)
        if user:
            user.last_login = datetime.utcnow()
            await session.commit()
            logger.debug("Last login updated", user_id=str(user_id))

    async def change_password(
            self,
            session: AsyncSession,
            user_id: uuid.UUID,
            current_password: str,
            new_password: str
    ) -> None:
        """Change user password."""

        user = await self.get_user_by_id(session, user_id)
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")

        if not verify_password(current_password, user.password_hash):
            raise InvalidCredentialsError("Current password is incorrect")

        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        await session.commit()

        logger.info(f"Password changed for user: {user.email}")


# Global service instance
user_service = UserService()