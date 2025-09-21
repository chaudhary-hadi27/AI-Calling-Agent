"""API routes for call management."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import db_manager, CallStatus
from ...core.call_service import call_service
from ...api.schemas import (
    CallCreate, CallResponse, CallStatusUpdate,
    APIResponse, PaginatedResponse
)
from ...utils.logger import get_logger
from ...utils.exceptions import (
    CallError, CallNotFoundError, CallAlreadyInProgressError,
    InvalidCallStateError, AICallingAgentException
)

logger = get_logger(__name__)
router = APIRouter()


# Dependency to get database session
async def get_db_session() -> AsyncSession:
    """Get database session dependency."""
    async with db_manager.get_session() as session:
        yield session


@router.post("/", response_model=CallResponse, status_code=status.HTTP_201_CREATED)
async def create_call(
        call_data: CallCreate,
        session: AsyncSession = Depends(get_db_session)
):
    """
    Create a new call record.

    This endpoint creates a call record in the database but doesn't
    initiate the actual phone call yet. Use /calls/{id}/start to begin calling.
    """
    try:
        call = await call_service.create_call(session, call_data)

        logger.info(
            "Call created via API",
            call_id=str(call.id),
            to_number=call_data.to_number
        )

        return CallResponse.from_orm(call)

    except AICallingAgentException:
        raise
    except Exception as e:
        logger.error("Unexpected error creating call", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create call: {str(e)}"
        )


@router.post("/make", response_model=CallResponse)
async def make_call_immediately(
        call_data: CallCreate,
        session: AsyncSession = Depends(get_db_session)
):
    """
    Create and immediately initiate a phone call.

    This is a convenience endpoint that creates a call record
    and starts the phone call in one request.
    """
    try:
        # Create call record
        call = await call_service.create_call(session, call_data)

        # Immediately initiate the call
        call = await call_service.initiate_call(
            session,
            call.id,
            script=call_data.script
        )

        logger.info(
            "Call created and initiated via API",
            call_id=str(call.id),
            call_sid=call.call_sid,
            to_number=call_data.to_number
        )

        return CallResponse.from_orm(call)

    except AICallingAgentException:
        raise
    except Exception as e:
        logger.error("Unexpected error making call", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to make call: {str(e)}"
        )


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
        call_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Get call details by ID."""
    try:
        call = await call_service.get_call_by_id(session, call_id)

        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Call {call_id} not found"
            )

        return CallResponse.from_orm(call)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving call", call_id=str(call_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve call: {str(e)}"
        )


@router.post("/{call_id}/start", response_model=CallResponse)
async def start_call(
        call_id: UUID,
        script: Optional[str] = None,
        session: AsyncSession = Depends(get_db_session)
):
    """
    Start/initiate a phone call.

    Takes a call record that's in 'queued' status and initiates
    the actual phone call via Twilio.
    """
    try:
        call = await call_service.initiate_call(session, call_id, script)

        logger.info(
            "Call started via API",
            call_id=str(call_id),
            call_sid=call.call_sid
        )

        return CallResponse.from_orm(call)

    except CallNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call {call_id} not found"
        )
    except CallAlreadyInProgressError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except AICallingAgentException:
        raise
    except Exception as e:
        logger.error("Unexpected error starting call", call_id=str(call_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start call: {str(e)}"
        )


@router.post("/{call_id}/hangup", response_model=CallResponse)
async def hangup_call(
        call_id: UUID,
        session: AsyncSession = Depends(get_db_session)
):
    """Hangup/end an active phone call."""
    try:
        call = await call_service.hangup_call(session, call_id)

        logger.info(
            "Call hangup via API",
            call_id=str(call_id),
            call_sid=call.call_sid
        )

        return CallResponse.from_orm(call)

    except CallNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call {call_id} not found"
        )
    except InvalidCallStateError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except AICallingAgentException:
        raise
    except Exception as e:
        logger.error("Unexpected error hanging up call", call_id=str(call_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to hangup call: {str(e)}"
        )


@router.get("/{call_id}/status", response_model=dict)
async def get_call_status(
        call_id: UUID,
        sync_from_twilio: bool = Query(False, description="Sync status from Twilio API"),
        session: AsyncSession = Depends(get_db_session)
):
    """
    Get current call status.

    Args:
        call_id: Call ID
        sync_from_twilio: Whether to sync latest status from Twilio API
    """
    try:
        if sync_from_twilio:
            call = await call_service.sync_call_status_from_twilio(session, call_id)
        else:
            call = await call_service.get_call_by_id(session, call_id)

        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Call {call_id} not found"
            )

        return {
            "call_id": str(call.id),
            "call_sid": call.call_sid,
            "status": call.status,
            "duration_seconds": call.duration_seconds,
            "answered_at": call.answered_at,
            "ended_at": call.ended_at,
            "cost": call.cost,
            "updated_at": call.updated_at
        }

    except CallNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call {call_id} not found"
        )
    except AICallingAgentException:
        raise
    except Exception as e:
        logger.error("Error getting call status", call_id=str(call_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get call status: {str(e)}"
        )


@router.get("/", response_model=List[CallResponse])
async def list_calls(
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
        status: Optional[CallStatus] = Query(None, description="Filter by call status"),
        campaign_id: Optional[UUID] = Query(None, description="Filter by campaign ID"),
        session: AsyncSession = Depends(get_db_session)
):
    """List calls with optional filtering and pagination."""
    try:
        calls = await call_service.get_calls_list(
            session=session,
            skip=skip,
            limit=limit,
            status=status,
            campaign_id=campaign_id
        )

        return [CallResponse.from_orm(call) for call in calls]

    except Exception as e:
        logger.error("Error listing calls", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list calls: {str(e)}"
        )


@router.patch("/{call_id}/status", response_model=CallResponse)
async def update_call_status(
        call_id: UUID,
        status_data: CallStatusUpdate,
        session: AsyncSession = Depends(get_db_session)
):
    """
    Update call status and related fields.

    This endpoint is typically used by webhooks or internal processes
    to update call status based on provider callbacks.
    """
    try:
        call = await call_service.update_call_status(session, call_id, status_data)

        logger.info(
            "Call status updated via API",
            call_id=str(call_id),
            new_status=status_data.status
        )

        return CallResponse.from_orm(call)

    except CallNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call {call_id} not found"
        )
    except AICallingAgentException:
        raise
    except Exception as e:
        logger.error("Error updating call status", call_id=str(call_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update call status: {str(e)}"
        )