"""User service for database operations."""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import User, UserRole
from ..core.security import hash_password, verify_password
from ..schemas.user import UserCreate
from ..utils.logger import get_logger
from ..utils.exceptions import UserAlreadyExistsError, UserNotFoundError, InvalidCredentialsError

logger = get_logger(__name__)


class UserService:
    """Service for user operations."""

    async def create_user(
            self,
            session: AsyncSession,
            user_data: UserCreate
    ) -> User:
        """Create a new user."""

        # Check if user already exists
        existing_user = await self.get_user_by_email(session, user_data.email)
        if existing_user:
            raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")

        # Hash password
        password_hash = hash_password(user_data.password)

        # Create user
        user = User(
            id=uuid.uuid4(),
            email=user_data.email,
            username=user_data.username,
            password_hash=password_hash,
            full_name=user_data.full_name,
            role=UserRole.USER,
            is_active=True
        )

        session.add(user)
        await session.commit()
        await session.refresh(user)

        logger.info(f"User created: {user.email}")
        return user

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
        from datetime import datetime

        user = await self.get_user_by_id(session, user_id)
        if user:
            user.last_login = datetime.utcnow()
            await session.commit()

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
        await session.commit()

        logger.info(f"Password changed for user: {user.email}")


# Global service instance
user_service = UserService()