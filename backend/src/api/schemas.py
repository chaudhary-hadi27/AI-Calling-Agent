"""Pydantic schemas for API requests and responses."""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from ..core.database import CallStatus, CallDirection, CampaignStatus


# Contact schemas
class ContactCreate(BaseModel):
    phone_number: str = Field(..., description="Phone number in E.164 format")
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None)
    metadata: Optional[Dict] = Field(default_factory=dict)

    @validator('phone_number')
    def validate_phone_number(cls, v):
        # Basic phone number validation
        if not v.startswith('+'):
            raise ValueError('Phone number must start with +')
        if not v[1:].isdigit():
            raise ValueError('Phone number must contain only digits after +')
        return v


class ContactResponse(BaseModel):
    id: UUID
    phone_number: str
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    metadata: Optional[Dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Call schemas
class CallCreate(BaseModel):
    to_number: str = Field(..., description="Phone number to call")
    script: Optional[str] = Field(None, description="AI agent script/prompt")
    contact_id: Optional[UUID] = Field(None)
    campaign_id: Optional[UUID] = Field(None)
    metadata: Optional[Dict] = Field(default_factory=dict)

    @validator('to_number')
    def validate_to_number(cls, v):
        if not v.startswith('+'):
            raise ValueError('Phone number must start with +')
        return v


class CallResponse(BaseModel):
    id: UUID
    call_sid: Optional[str]
    direction: CallDirection
    status: CallStatus
    from_number: str
    to_number: str
    contact_id: Optional[UUID]
    campaign_id: Optional[UUID]
    duration_seconds: Optional[int]
    answered_at: Optional[datetime]
    ended_at: Optional[datetime]
    cost: Optional[float]
    transcript: Optional[str]
    conversation_summary: Optional[str]
    sentiment_score: Optional[float]
    intent_detected: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]

    class Config:
        from_attributes = True


class CallStatusUpdate(BaseModel):
    status: CallStatus
    call_sid: Optional[str] = None
    duration_seconds: Optional[int] = None
    answered_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    cost: Optional[float] = None
    error_message: Optional[str] = None
    provider_data: Optional[Dict] = None


# Campaign schemas
class CampaignCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    script: Optional[str] = Field(None, description="AI agent script for all calls")
    contact_ids: List[UUID] = Field(..., description="List of contact IDs to call")
    max_concurrent_calls: int = Field(5, ge=1, le=20)
    retry_attempts: int = Field(3, ge=0, le=10)
    retry_delay_minutes: int = Field(60, ge=1)
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None


class CampaignResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    status: CampaignStatus
    script: Optional[str]
    max_concurrent_calls: int
    retry_attempts: int
    retry_delay_minutes: int
    scheduled_start: Optional[datetime]
    scheduled_end: Optional[datetime]
    total_contacts: int
    calls_completed: int
    calls_failed: int
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class CampaignStats(BaseModel):
    total_contacts: int
    calls_completed: int
    calls_failed: int
    calls_in_progress: int
    success_rate: float
    average_duration: Optional[float]
    total_cost: Optional[float]


# Webhook schemas
class TwilioVoiceWebhook(BaseModel):
    AccountSid: str
    CallSid: str
    CallStatus: str
    Direction: str
    From: str
    To: str
    CallerName: Optional[str] = None
    ForwardedFrom: Optional[str] = None
    CallerCity: Optional[str] = None
    CallerState: Optional[str] = None
    CallerZip: Optional[str] = None
    CallerCountry: Optional[str] = None


class TwilioStatusWebhook(BaseModel):
    AccountSid: str
    CallSid: str
    CallStatus: str
    CallDuration: Optional[str] = None
    RecordingUrl: Optional[str] = None
    RecordingSid: Optional[str] = None
    From: str
    To: str
    Direction: str
    Timestamp: Optional[str] = None


# Response wrappers
class APIResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Dict] = None


class PaginatedResponse(BaseModel):
    items: List[Dict]
    total: int
    page: int
    per_page: int
    pages: int
    has_next: bool
    has_prev: bool