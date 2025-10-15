"""Database configuration and models."""

import enum
import uuid
from datetime import datetime
from typing import AsyncGenerator, Optional

from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey, Integer,
    JSON, String, Text, create_engine
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from ..utils.config import get_settings
from ..utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


class CallStatus(str, enum.Enum):
    """Call status enumeration."""
    QUEUED = "queued"
    INITIATING = "initiating"
    RINGING = "ringing"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    NO_ANSWER = "no_answer"
    BUSY = "busy"
    CANCELED = "canceled"


class CampaignStatus(str, enum.Enum):
    """Campaign status enumeration."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class CallDirection(str, enum.Enum):
    """Call direction enumeration."""
    INBOUND = "inbound"
    OUTBOUND = "outbound"


# ============================================
# USER MODELS (NEW)
# ============================================

class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"


class User(Base):
    """User model for authentication."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))

    # Profile
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # MFA
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[Optional[str]] = mapped_column(String(255))
    backup_codes: Mapped[Optional[list]] = mapped_column(JSON, default=[])

    # Metadata
    metadata: Mapped[Optional[dict]] = mapped_column(JSON, default={})

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    campaigns: Mapped[list["Campaign"]] = relationship("Campaign", back_populates="created_by")


# ============================================
# EXISTING MODELS (KEEP)
# ============================================

class Contact(Base):
    """Contact model for storing phone numbers and metadata."""

    __tablename__ = "contacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    metadata: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    calls: Mapped[list["Call"]] = relationship("Call", back_populates="contact")
    campaign_contacts: Mapped[list["CampaignContact"]] = relationship("CampaignContact", back_populates="contact")


class Campaign(Base):
    """Campaign model for bulk calling campaigns."""

    __tablename__ = "campaigns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[CampaignStatus] = mapped_column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)

    # Foreign key
    created_by_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Campaign settings
    script: Mapped[Optional[str]] = mapped_column(Text)
    max_concurrent_calls: Mapped[int] = mapped_column(Integer, default=5)
    retry_attempts: Mapped[int] = mapped_column(Integer, default=3)
    retry_delay_minutes: Mapped[int] = mapped_column(Integer, default=60)

    # Scheduling
    scheduled_start: Mapped[Optional[datetime]] = mapped_column(DateTime)
    scheduled_end: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Statistics
    total_contacts: Mapped[int] = mapped_column(Integer, default=0)
    calls_completed: Mapped[int] = mapped_column(Integer, default=0)
    calls_failed: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    created_by: Mapped["User"] = relationship("User", back_populates="campaigns")
    calls: Mapped[list["Call"]] = relationship("Call", back_populates="campaign")
    campaign_contacts: Mapped[list["CampaignContact"]] = relationship("CampaignContact", back_populates="campaign")


class CampaignContact(Base):
    """Many-to-many relationship between campaigns and contacts."""

    __tablename__ = "campaign_contacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    contact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False)

    # Call attempts tracking
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_attempt_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    next_attempt_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="campaign_contacts")
    contact: Mapped["Contact"] = relationship("Contact", back_populates="campaign_contacts")


class Call(Base):
    """Call model for individual call records."""

    __tablename__ = "calls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Twilio identifiers
    call_sid: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    parent_call_sid: Mapped[Optional[str]] = mapped_column(String(50))

    # Call details
    direction: Mapped[CallDirection] = mapped_column(Enum(CallDirection), nullable=False)
    status: Mapped[CallStatus] = mapped_column(Enum(CallStatus), default=CallStatus.QUEUED)
    from_number: Mapped[str] = mapped_column(String(20), nullable=False)
    to_number: Mapped[str] = mapped_column(String(20), nullable=False)

    # Foreign keys
    contact_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id"))
    campaign_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("campaigns.id"))

    # Call metrics
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    answered_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    cost: Mapped[Optional[float]] = mapped_column(Float)

    # AI conversation data
    transcript: Mapped[Optional[str]] = mapped_column(Text)
    conversation_summary: Mapped[Optional[str]] = mapped_column(Text)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)
    intent_detected: Mapped[Optional[str]] = mapped_column(String(100))

    # Technical details
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    provider_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    contact: Mapped[Optional["Contact"]] = relationship("Contact", back_populates="calls")
    campaign: Mapped[Optional["Campaign"]] = relationship("Campaign", back_populates="calls")
    call_logs: Mapped[list["CallLog"]] = relationship("CallLog", back_populates="call", cascade="all, delete-orphan")


class CallLog(Base):
    """Detailed call logs for conversation flow tracking."""

    __tablename__ = "call_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"), nullable=False)

    # Log entry details
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)

    # Content
    content: Mapped[Optional[str]] = mapped_column(Text)
    raw_audio_url: Mapped[Optional[str]] = mapped_column(String(500))
    confidence_score: Mapped[Optional[float]] = mapped_column(Float)

    # Timing
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer)

    # Metadata
    metadata: Mapped[Optional[dict]] = mapped_column(JSON)

    # Relationships
    call: Mapped["Call"] = relationship("Call", back_populates="call_logs")


# ============================================
# DATABASE MANAGER
# ============================================

class DatabaseManager:
    """Database connection and session manager."""

    def __init__(self):
        self.engine = None
        self.async_session_factory = None

    def init_db(self) -> None:
        """Initialize database connection."""
        self.engine = create_async_engine(
            settings.database.url,
            echo=settings.database.echo,
            pool_size=settings.database.pool_size,
            max_overflow=settings.database.max_overflow,
        )

        self.async_session_factory = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        logger.info("Database connection initialized", url=settings.database.url)

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get async database session."""
        if not self.async_session_factory:
            raise RuntimeError("Database not initialized. Call init_db() first.")

        async with self.async_session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    async def close(self) -> None:
        """Close database connection."""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database connection closed")


# Global database manager instance
db_manager = DatabaseManager()