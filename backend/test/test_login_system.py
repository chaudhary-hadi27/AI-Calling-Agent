#!/usr/bin/env python3
"""Create a test user for development."""

import asyncio
import sys
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.database import db_manager, User, UserRole
from src.core.security import hash_password
from src.utils.logger import setup_logging, get_logger
import uuid

setup_logging()
logger = get_logger(__name__)


async def create_test_user():
    """Create a verified test user."""

    db_manager.init_db()

    test_email = "test@smartkode.com"
    test_password = "Test123456"
    test_name = "Test User"

    try:
        async with db_manager.get_session() as session:
            # Check if user exists
            from sqlalchemy import select

            existing = await session.scalar(
                select(User).where(User.email == test_email)
            )

            if existing:
                logger.info(f"User {test_email} already exists!")
                logger.info(f"Password: {test_password}")
                return

            # Create new user
            user = User(
                id=uuid.uuid4(),
                email=test_email,
                username="testuser",
                password_hash=hash_password(test_password),
                full_name=test_name,
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,  # Pre-verified for testing
                extra_data={}
            )

            session.add(user)
            await session.commit()

            logger.info("✅ Test user created successfully!")
            logger.info(f"Email: {test_email}")
            logger.info(f"Password: {test_password}")
            logger.info(f"Role: {user.role}")
            logger.info(f"Verified: {user.is_verified}")

            print("\n" + "=" * 50)
            print("🎉 TEST USER CREATED")
            print("=" * 50)
            print(f"Email:    {test_email}")
            print(f"Password: {test_password}")
            print(f"Role:     {user.role}")
            print("=" * 50)
            print("\nYou can now login with these credentials!")
            print("=" * 50 + "\n")

    except Exception as e:
        logger.error(f"Failed to create test user: {str(e)}")
        raise
    finally:
        await db_manager.close()


if __name__ == "__main__":
    asyncio.run(create_test_user())