#!/usr/bin/env python3
"""Database setup and migration script."""

import asyncio
import sys
import os
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine
import asyncpg

from src.core.database import Base, db_manager
from src.utils.config import get_settings
from src.utils.logger import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)
settings = get_settings()


async def create_database_if_not_exists():
    """Create the database if it doesn't exist."""
    try:
        # Parse database URL to get connection details
        from urllib.parse import urlparse
        parsed = urlparse(settings.database.url)

        if parsed.scheme.startswith('postgresql'):
            # Connect to postgres database to create our database
            postgres_url = settings.database.url.rsplit('/', 1)[0] + '/postgres'

            # Remove the asyncpg part for initial connection
            sync_postgres_url = postgres_url.replace('+asyncpg', '')

            engine = create_engine(sync_postgres_url)

            database_name = parsed.path.lstrip('/')

            with engine.connect() as conn:
                # Set autocommit for database creation
                conn = conn.execution_options(autocommit=True)

                # Check if database exists
                result = conn.execute(text(
                    "SELECT 1 FROM pg_database WHERE datname = :db_name"
                ), {"db_name": database_name})

                if not result.fetchone():
                    logger.info(f"Creating database: {database_name}")
                    conn.execute(text(f'CREATE DATABASE "{database_name}"'))
                    logger.info(f"Database {database_name} created successfully")
                else:
                    logger.info(f"Database {database_name} already exists")

            engine.dispose()

        elif parsed.scheme.startswith('sqlite'):
            # SQLite databases are created automatically
            logger.info("Using SQLite - database will be created automatically")

        else:
            logger.warning(f"Unsupported database scheme: {parsed.scheme}")

    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        raise


async def create_tables():
    """Create all database tables."""
    try:
        logger.info("Creating database tables...")

        # Initialize database manager
        db_manager.init_db()

        # Create all tables
        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("All tables created successfully")

    except Exception as e:
        logger.error(f"Error creating tables: {str(e)}")
        raise


async def drop_all_tables():
    """Drop all database tables (use with caution!)."""
    try:
        logger.warning("Dropping all database tables...")

        db_manager.init_db()

        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

        logger.info("All tables dropped successfully")

    except Exception as e:
        logger.error(f"Error dropping tables: {str(e)}")
        raise


async def seed_sample_data():
    """Insert sample data for testing."""
    try:
        logger.info("Seeding sample data...")

        from src.core.database import Contact, Campaign, CampaignContact
        from datetime import datetime
        import uuid

        async with db_manager.get_session() as session:
            # Create sample contacts
            contacts = [
                Contact(
                    id=uuid.uuid4(),
                    phone_number="+1234567890",
                    first_name="John",
                    last_name="Doe",
                    email="john.doe@example.com",
                    metadata={"source": "sample_data", "priority": "high"}
                ),
                Contact(
                    id=uuid.uuid4(),
                    phone_number="+1234567891",
                    first_name="Jane",
                    last_name="Smith",
                    email="jane.smith@example.com",
                    metadata={"source": "sample_data", "priority": "medium"}
                ),
                Contact(
                    id=uuid.uuid4(),
                    phone_number="+1234567892",
                    first_name="Bob",
                    last_name="Johnson",
                    email="bob.johnson@example.com",
                    metadata={"source": "sample_data", "priority": "low"}
                )
            ]

            for contact in contacts:
                session.add(contact)

            await session.flush()  # Get IDs

            # Create sample campaign
            campaign = Campaign(
                id=uuid.uuid4(),
                name="Sample Sales Campaign",
                description="A sample campaign for testing the AI calling agent",
                script="Hello! I'm calling from our company to discuss our exciting new product that could benefit your business. Do you have a few minutes to chat?",
                max_concurrent_calls=3,
                retry_attempts=2,
                total_contacts=len(contacts)
            )

            session.add(campaign)
            await session.flush()

            # Associate contacts with campaign
            for contact in contacts:
                campaign_contact = CampaignContact(
                    id=uuid.uuid4(),
                    campaign_id=campaign.id,
                    contact_id=contact.id,
                    attempts=0
                )
                session.add(campaign_contact)

            await session.commit()

        logger.info(f"Sample data seeded: {len(contacts)} contacts, 1 campaign")

    except Exception as e:
        logger.error(f"Error seeding sample data: {str(e)}")
        raise


async def check_database_health():
    """Check database connection and table status."""
    try:
        logger.info("Checking database health...")

        db_manager.init_db()

        async with db_manager.get_session() as session:
            # Test basic connection
            await session.execute(text("SELECT 1"))

            # Check if tables exist
            from src.core.database import Contact, Campaign, Call

            # Count records in each table
            contact_count = await session.execute(text("SELECT COUNT(*) FROM contacts"))
            campaign_count = await session.execute(text("SELECT COUNT(*) FROM campaigns"))
            call_count = await session.execute(text("SELECT COUNT(*) FROM calls"))

            logger.info("Database health check results:")
            logger.info(f"  - Contacts: {contact_count.scalar()}")
            logger.info(f"  - Campaigns: {campaign_count.scalar()}")
            logger.info(f"  - Calls: {call_count.scalar()}")

        logger.info("Database health check passed")
        return True

    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False


async def migrate_database():
    """Run database migrations."""
    logger.info("Running database migrations...")

    # In a real application, you'd use Alembic for migrations
    # This is a simplified version that just recreates tables

    try:
        await create_tables()
        logger.info("Database migration completed successfully")
    except Exception as e:
        logger.error(f"Database migration failed: {str(e)}")
        raise


async def reset_database():
    """Reset database (drop and recreate everything)."""
    logger.warning("Resetting database - all data will be lost!")

    try:
        await drop_all_tables()
        await create_tables()
        await seed_sample_data()
        logger.info("Database reset completed successfully")
    except Exception as e:
        logger.error(f"Database reset failed: {str(e)}")
        raise


def print_usage():
    """Print usage information."""
    print("""
Database Setup Script Usage:

python setup_database.py <command>

Commands:
    create      - Create database and tables
    migrate     - Run migrations (create tables if they don't exist)
    reset       - Drop all tables and recreate with sample data
    seed        - Add sample data to existing database
    health      - Check database health and show statistics
    drop        - Drop all tables (DESTRUCTIVE!)

Examples:
    python setup_database.py create
    python setup_database.py health
    python setup_database.py reset
    """)


async def main():
    """Main function to handle database setup commands."""
    if len(sys.argv) < 2:
        print_usage()
        return

    command = sys.argv[1].lower()

    logger.info(f"Database setup command: {command}")
    logger.info(f"Database URL: {settings.database.url}")

    try:
        if command == "create":
            await create_database_if_not_exists()
            await create_tables()
            logger.info("Database creation completed")

        elif command == "migrate":
            await create_database_if_not_exists()
            await migrate_database()

        elif command == "reset":
            confirm = input("This will delete all data. Are you sure? (yes/no): ")
            if confirm.lower() == "yes":
                await create_database_if_not_exists()
                await reset_database()
            else:
                logger.info("Database reset cancelled")

        elif command == "seed":
            await seed_sample_data()

        elif command == "health":
            healthy = await check_database_health()
            sys.exit(0 if healthy else 1)

        elif command == "drop":
            confirm = input("This will delete all tables and data. Are you sure? (yes/no): ")
            if confirm.lower() == "yes":
                await drop_all_tables()
            else:
                logger.info("Table drop cancelled")

        else:
            logger.error(f"Unknown command: {command}")
            print_usage()
            sys.exit(1)

    except Exception as e:
        logger.error(f"Command failed: {str(e)}")
        sys.exit(1)

    finally:
        # Clean up database connections
        await db_manager.close()


if __name__ == "__main__":
    asyncio.run(main())