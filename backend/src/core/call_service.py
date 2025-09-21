"""Call service for managing call operations."""

import uuid
from datetime import datetime
from typing import Dict, List, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .database import Call, Contact, Campaign, CallStatus, CallDirection
from ..api.schemas import CallCreate, CallStatusUpdate
from ..telephony.twilio_client import twilio_client
from ..utils.logger import LoggerMixin
from ..utils.exceptions import (
    CallError, CallNotFoundError, CallAlreadyInProgressError,
    InvalidCallStateError, TwilioError
)


class CallService(LoggerMixin):
    """Service for managing call operations."""

    async def create_call(
            self,
            session: AsyncSession,
            call_data: CallCreate
    ) -> Call:
        """
        Create a new call record.

        Args:
            session: Database session
            call_data: Call creation data

        Returns:
            Created call instance
        """
        try:
            # Validate contact exists if provided
            if call_data.contact_id:
                contact_query = select(Contact).where(Contact.id == call_data.contact_id)
                contact = await session.scalar(contact_query)
                if not contact:
                    raise CallError(f"Contact {call_data.contact_id} not found")

            # Validate campaign exists if provided
            if call_data.campaign_id:
                campaign_query = select(Campaign).where(Campaign.id == call_data.campaign_id)
                campaign = await session.scalar(campaign_query)
                if not campaign:
                    raise CallError(f"Campaign {call_data.campaign_id} not found")

            # Create call record
            call = Call(
                id=uuid.uuid4(),
                direction=CallDirection.OUTBOUND,
                status=CallStatus.QUEUED,
                from_number=twilio_client.phone_number,
                to_number=call_data.to_number,
                contact_id=call_data.contact_id,
                campaign_id=call_data.campaign_id,
                created_at=datetime.utcnow(),
            )

            session.add(call)
            await session.commit()
            await session.refresh(call)

            self.logger.info(
                "Call record created",
                call_id=str(call.id),
                to_number=call_data.to_number,
                contact_id=str(call_data.contact_id) if call_data.contact_id else None
            )

            return call

        except Exception as e:
            await session.rollback()
            self.logger.error("Failed to create call record", error=str(e))
            raise

    async def initiate_call(
            self,
            session: AsyncSession,
            call_id: uuid.UUID,
            script: Optional[str] = None
    ) -> Call:
        """
        Initiate an outbound call via Twilio.

        Args:
            session: Database session
            call_id: Call ID to initiate
            script: AI agent script (optional)

        Returns:
            Updated call instance
        """
        # Get call record
        call = await self.get_call_by_id(session, call_id)

        if not call:
            raise CallNotFoundError(f"Call {call_id} not found")

        if call.status not in [CallStatus.QUEUED]:
            raise CallAlreadyInProgressError(
                f"Call {call_id} is already in progress (status: {call.status})"
            )

        try:
            # Update status to initiating
            call.status = CallStatus.INITIATING
            call.started_at = datetime.utcnow()
            await session.commit()

            # Make Twilio call
            twilio_response = await twilio_client.make_call(
                to_number=call.to_number,
                call_id=str(call_id),
                script_url=None,  # We'll build webhook handlers next
            )

            # Update call with Twilio data
            call.call_sid = twilio_response['call_sid']
            call.status = CallStatus.RINGING
            call.provider_data = twilio_response

            await session.commit()

            self.logger.info(
                "Call initiated successfully",
                call_id=str(call_id),
                call_sid=call.call_sid,
                to_number=call.to_number
            )

            return call

        except TwilioError as e:
            # Update call status to failed
            call.status = CallStatus.FAILED
            call.error_message = str(e)
            call.ended_at = datetime.utcnow()
            await session.commit()

            self.logger.error(
                "Call initiation failed",
                call_id=str(call_id),
                error=str(e)
            )
            raise

        except Exception as e:
            await session.rollback()
            self.logger.error("Unexpected error during call initiation", error=str(e))
            raise CallError(f"Failed to initiate call: {str(e)}")

    async def get_call_by_id(
            self,
            session: AsyncSession,
            call_id: uuid.UUID
    ) -> Optional[Call]:
        """Get call by ID with related data."""
        query = select(Call).options(
            selectinload(Call.contact),
            selectinload(Call.campaign)
        ).where(Call.id == call_id)

        return await session.scalar(query)

    async def get_call_by_sid(
            self,
            session: AsyncSession,
            call_sid: str
    ) -> Optional[Call]:
        """Get call by Twilio SID."""
        query = select(Call).where(Call.call_sid == call_sid)
        return await session.scalar(query)

    async def update_call_status(
            self,
            session: AsyncSession,
            call_id: uuid.UUID,
            status_data: CallStatusUpdate
    ) -> Call:
        """
        Update call status and related data.

        Args:
            session: Database session
            call_id: Call ID to update
            status_data: Status update data

        Returns:
            Updated call instance
        """
        call = await self.get_call_by_id(session, call_id)

        if not call:
            raise CallNotFoundError(f"Call {call_id} not found")

        # Update fields
        call.status = status_data.status

        if status_data.call_sid:
            call.call_sid = status_data.call_sid

        if status_data.duration_seconds is not None:
            call.duration_seconds = status_data.duration_seconds

        if status_data.answered_at:
            call.answered_at = status_data.answered_at

        if status_data.ended_at:
            call.ended_at = status_data.ended_at

        if status_data.cost is not None:
            call.cost = status_data.cost

        if status_data.error_message:
            call.error_message = status_data.error_message

        if status_data.provider_data:
            call.provider_data = status_data.provider_data

        call.updated_at = datetime.utcnow()

        await session.commit()

        self.logger.info(
            "Call status updated",
            call_id=str(call_id),
            old_status=call.status,
            new_status=status_data.status
        )

        return call

    async def hangup_call(
            self,
            session: AsyncSession,
            call_id: uuid.UUID
    ) -> Call:
        """
        Hangup an active call.

        Args:
            session: Database session
            call_id: Call ID to hangup

        Returns:
            Updated call instance
        """
        call = await self.get_call_by_id(session, call_id)

        if not call:
            raise CallNotFoundError(f"Call {call_id} not found")

        if call.status not in [CallStatus.RINGING, CallStatus.IN_PROGRESS]:
            raise InvalidCallStateError(
                f"Cannot hangup call {call_id} in status {call.status}"
            )

        if not call.call_sid:
            raise CallError(f"Call {call_id} has no Twilio SID")

        try:
            # Hangup via Twilio
            await twilio_client.hangup_call(call.call_sid)

            # Update local status
            call.status = CallStatus.COMPLETED
            call.ended_at = datetime.utcnow()
            call.updated_at = datetime.utcnow()

            await session.commit()

            self.logger.info(
                "Call hangup successful",
                call_id=str(call_id),
                call_sid=call.call_sid
            )

            return call

        except Exception as e:
            self.logger.error(
                "Failed to hangup call",
                call_id=str(call_id),
                error=str(e)
            )
            raise CallError(f"Failed to hangup call: {str(e)}")

    async def get_calls_list(
            self,
            session: AsyncSession,
            skip: int = 0,
            limit: int = 50,
            status: Optional[CallStatus] = None,
            campaign_id: Optional[uuid.UUID] = None
    ) -> List[Call]:
        """Get list of calls with optional filtering."""
        query = select(Call).options(
            selectinload(Call.contact),
            selectinload(Call.campaign)
        ).order_by(Call.created_at.desc())

        if status:
            query = query.where(Call.status == status)

        if campaign_id:
            query = query.where(Call.campaign_id == campaign_id)

        query = query.offset(skip).limit(limit)

        result = await session.execute(query)
        return result.scalars().all()

    async def sync_call_status_from_twilio(
            self,
            session: AsyncSession,
            call_id: uuid.UUID
    ) -> Call:
        """Sync call status from Twilio API."""
        call = await self.get_call_by_id(session, call_id)

        if not call or not call.call_sid:
            raise CallNotFoundError(f"Call {call_id} not found or has no Twilio SID")

        try:
            # Get current status from Twilio
            twilio_status = await twilio_client.get_call_status(call.call_sid)

            # Map Twilio status to our status
            status_mapping = {
                'queued': CallStatus.QUEUED,
                'ringing': CallStatus.RINGING,
                'in-progress': CallStatus.IN_PROGRESS,
                'completed': CallStatus.COMPLETED,
                'busy': CallStatus.BUSY,
                'no-answer': CallStatus.NO_ANSWER,
                'failed': CallStatus.FAILED,
                'canceled': CallStatus.CANCELED,
            }

            new_status = status_mapping.get(twilio_status['status'], CallStatus.FAILED)

            # Update call record
            call.status = new_status
            if twilio_status.get('duration'):
                call.duration_seconds = int(twilio_status['duration'])
            if twilio_status.get('start_time'):
                call.answered_at = datetime.fromisoformat(twilio_status['start_time'].replace('Z', '+00:00'))
            if twilio_status.get('end_time'):
                call.ended_at = datetime.fromisoformat(twilio_status['end_time'].replace('Z', '+00:00'))
            if twilio_status.get('price'):
                call.cost = float(twilio_status['price'])

            call.updated_at = datetime.utcnow()

            await session.commit()

            return call

        except Exception as e:
            self.logger.error(
                "Failed to sync call status from Twilio",
                call_id=str(call_id),
                error=str(e)
            )
            raise CallError(f"Failed to sync call status: {str(e)}")


# Global service instance
call_service = CallService()