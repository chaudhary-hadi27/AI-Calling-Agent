"""Twilio webhook handlers for call events."""

import asyncio
import base64
import json
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Request, Form, HTTPException, status, Depends
from fastapi.responses import Response, PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import db_manager, CallStatus
from ..core.call_service import call_service
from ..core.session_manager import session_manager
from ..api.schemas import TwilioVoiceWebhook, TwilioStatusWebhook, CallStatusUpdate
from ..utils.logger import get_logger, log_call_event
from ..utils.exceptions import SessionNotFoundError, CallNotFoundError

logger = get_logger(__name__)
router = APIRouter()


# Dependency to get database session
async def get_db_session() -> AsyncSession:
    """Get database session dependency."""
    async with db_manager.get_session() as session:
        yield session


@router.post("/twilio/voice/{call_id}")
async def handle_voice_webhook(
        call_id: str,
        request: Request,
        session: AsyncSession = Depends(get_db_session)
):
    """
    Handle Twilio voice webhook - called when call connects.
    Returns TwiML to control call flow.
    """
    try:
        # Parse Twilio webhook data
        form_data = await request.form()
        webhook_data = TwilioVoiceWebhook(**dict(form_data))

        log_call_event(
            call_sid=webhook_data.CallSid,
            event_type="voice_webhook",
            status=webhook_data.CallStatus,
            direction=webhook_data.Direction
        )

        # Update call with Twilio SID if not already set
        call = await call_service.get_call_by_id(session, UUID(call_id))
        if call and not call.call_sid:
            await call_service.update_call_status(
                session,
                UUID(call_id),
                CallStatusUpdate(
                    status=CallStatus.IN_PROGRESS,
                    call_sid=webhook_data.CallSid,
                    answered_at=datetime.utcnow()
                )
            )

        # Create or get session
        try:
            session_obj = session_manager.get_session(call_id)
        except SessionNotFoundError:
            # Create session if doesn't exist
            call_data = {
                'call_sid': webhook_data.CallSid,
                'to_number': webhook_data.To,
                'from_number': webhook_data.From,
                'contact_id': call.contact_id if call else None,
                'campaign_id': call.campaign_id if call else None,
                'context': {}
            }
            session_obj = await session_manager.create_session(call_id, call_data)

        # Handle call answered - start conversation
        greeting_result = await session_manager.handle_call_answered(call_id)

        if not greeting_result['success']:
            # Error handling
            twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">I'm sorry, there seems to be a technical issue. Please try calling back later. Goodbye.</Say>
    <Hangup/>
</Response>"""
            return PlainTextResponse(content=twiml, media_type="application/xml")

        # Return TwiML to start conversation
        # We'll use Twilio's streaming capabilities for real-time conversation
        base_url = request.url_for("stream_handler", call_id=call_id)

        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">{greeting_result['text']}</Say>
    <Connect>
        <Stream url="wss://{request.url.hostname}/ws/stream/{call_id}" />
    </Connect>
</Response>"""

        return PlainTextResponse(content=twiml, media_type="application/xml")

    except Exception as e:
        logger.error(
            "Error handling voice webhook",
            call_id=call_id,
            error=str(e)
        )

        # Return error TwiML
        error_twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">I apologize, but I'm experiencing technical difficulties. Goodbye.</Say>
    <Hangup/>
</Response>"""
        return PlainTextResponse(content=error_twiml, media_type="application/xml")


@router.post("/twilio/status/{call_id}")
async def handle_status_webhook(
        call_id: str,
        request: Request,
        session: AsyncSession = Depends(get_db_session)
):
    """Handle Twilio call status updates."""
    try:
        # Parse status webhook data
        form_data = await request.form()
        status_data = TwilioStatusWebhook(**dict(form_data))

        log_call_event(
            call_sid=status_data.CallSid,
            event_type="status_update",
            status=status_data.CallStatus
        )

        # Map Twilio status to our status
        status_mapping = {
            'queued': CallStatus.QUEUED,
            'initiated': CallStatus.INITIATING,
            'ringing': CallStatus.RINGING,
            'in-progress': CallStatus.IN_PROGRESS,
            'completed': CallStatus.COMPLETED,
            'busy': CallStatus.BUSY,
            'no-answer': CallStatus.NO_ANSWER,
            'failed': CallStatus.FAILED,
            'canceled': CallStatus.CANCELED
        }

        new_status = status_mapping.get(status_data.CallStatus, CallStatus.FAILED)

        # Update call status in database
        update_data = CallStatusUpdate(
            status=new_status,
            call_sid=status_data.CallSid
        )

        if status_data.CallDuration:
            update_data.duration_seconds = int(status_data.CallDuration)

        if new_status in [CallStatus.COMPLETED, CallStatus.FAILED, CallStatus.NO_ANSWER, CallStatus.BUSY]:
            update_data.ended_at = datetime.utcnow()

        await call_service.update_call_status(session, UUID(call_id), update_data)

        # Handle session state changes
        if new_status == CallStatus.COMPLETED:
            await session_manager.handle_call_ended(call_id, reason="completed")
        elif new_status in [CallStatus.FAILED, CallStatus.NO_ANSWER, CallStatus.BUSY]:
            await session_manager.handle_call_ended(call_id, reason=status_data.CallStatus)

        return {"status": "success"}

    except Exception as e:
        logger.error(
            "Error handling status webhook",
            call_id=call_id,
            error=str(e)
        )
        return {"status": "error", "message": str(e)}


@router.post("/twilio/gather/{call_id}")
async def handle_gather_webhook(
        call_id: str,
        request: Request,
        SpeechResult: str = Form(None),
        Confidence: float = Form(None)
):
    """Handle speech input from Twilio Gather."""
    try:
        if not SpeechResult:
            # No speech detected, return TwiML to continue listening
            twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" timeout="10" speechTimeout="3" action="/webhooks/twilio/gather/{}" method="POST">
        <Say voice="Polly.Joanna">I'm listening...</Say>
    </Gather>
    <Say voice="Polly.Joanna">I didn't hear anything. Let me try again.</Say>
    <Redirect>/webhooks/twilio/gather/{}</Redirect>
</Response>""".format(call_id, call_id)

            return PlainTextResponse(content=twiml, media_type="application/xml")

        log_call_event(
            call_sid="",  # We don't have call_sid in this context
            event_type="speech_input",
            transcription=SpeechResult,
            confidence=Confidence
        )

        # Process speech with session manager
        # For this webhook, we simulate audio data from the transcription
        # In a real streaming setup, you'd have actual audio data
        fake_audio_data = SpeechResult.encode('utf-8')  # Placeholder

        response_result = await session_manager.handle_speech_input(
            call_id=call_id,
            audio_data=fake_audio_data,
            is_final=True
        )

        if not response_result['success']:
            # Error occurred
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">I apologize, I'm having trouble processing your request. Could you please repeat that?</Say>
    <Gather input="speech" timeout="10" speechTimeout="3" action="/webhooks/twilio/gather/{call_id}" method="POST">
        <Say voice="Polly.Joanna">Please try again.</Say>
    </Gather>
</Response>"""
            return PlainTextResponse(content=twiml, media_type="application/xml")

        # Check if call should end
        if response_result.get('should_end_call'):
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">{response_result['text']}</Say>
    <Hangup/>
</Response>"""
            return PlainTextResponse(content=twiml, media_type="application/xml")

        # Continue conversation
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">{response_result['text']}</Say>
    <Gather input="speech" timeout="10" speechTimeout="3" action="/webhooks/twilio/gather/{call_id}" method="POST">
        <Say voice="Polly.Joanna">What else can I help you with?</Say>
    </Gather>
    <Say voice="Polly.Joanna">Thank you for your time. Have a great day!</Say>
    <Hangup/>
</Response>"""

        return PlainTextResponse(content=twiml, media_type="application/xml")

    except Exception as e:
        logger.error(
            "Error handling gather webhook",
            call_id=call_id,
            speech_result=SpeechResult,
            error=str(e)
        )

        error_twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">I'm experiencing technical difficulties. Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>"""
        return PlainTextResponse(content=error_twiml, media_type="application/xml")


@router.post("/twilio/recording/{call_id}")
async def handle_recording_webhook(
        call_id: str,
        request: Request,
        RecordingUrl: str = Form(...),
        RecordingSid: str = Form(...),
        RecordingDuration: str = Form(None)
):
    """Handle call recording webhook."""
    try:
        logger.info(
            "Recording available",
            call_id=call_id,
            recording_sid=RecordingSid,
            recording_url=RecordingUrl,
            duration=RecordingDuration
        )

        # Store recording information in database
        async with db_manager.get_session() as session:
            call = await call_service.get_call_by_id(session, UUID(call_id))
            if call:
                # Update call with recording info
                provider_data = call.provider_data or {}
                provider_data['recording_url'] = RecordingUrl
                provider_data['recording_sid'] = RecordingSid
                if RecordingDuration:
                    provider_data['recording_duration'] = int(RecordingDuration)

                await call_service.update_call_status(
                    session,
                    UUID(call_id),
                    CallStatusUpdate(
                        status=call.status,
                        provider_data=provider_data
                    )
                )

        # TODO: Process recording for transcription and analysis
        # This could trigger background task to:
        # 1. Download recording
        # 2. Transcribe full conversation
        # 3. Analyze sentiment and outcomes
        # 4. Update database with results

        return {"status": "success", "message": "Recording processed"}

    except Exception as e:
        logger.error(
            "Error handling recording webhook",
            call_id=call_id,
            error=str(e)
        )
        return {"status": "error", "message": str(e)}


@router.get("/twilio/health")
async def webhook_health_check():
    """Health check endpoint for webhooks."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_sessions": session_manager.get_active_sessions_count()
    }


@router.post("/test/simulate-call")
async def simulate_call_webhook(
        to_number: str,
        test_message: str = "Hello, this is a test call."
):
    """Simulate a call for testing purposes."""
    try:
        # This endpoint simulates the entire call flow for testing
        call_id = str(UUID('12345678-1234-5678-9012-123456789012'))  # Fixed UUID for testing

        # Create test session
        call_data = {
            'call_sid': 'test_call_sid',
            'to_number': to_number,
            'from_number': '+1234567890',
            'contact_id': None,
            'campaign_id': None,
            'context': {'test_mode': True}
        }

        session = await session_manager.create_session(call_id, call_data)

        # Simulate call answered
        greeting = await session_manager.handle_call_answered(call_id)

        # Simulate user speech input
        fake_audio = test_message.encode('utf-8')
        response = await session_manager.handle_speech_input(call_id, fake_audio)

        # End call
        await session_manager.handle_call_ended(call_id, "test_completed")

        return {
            "status": "success",
            "greeting": greeting.get('text', ''),
            "user_input": test_message,
            "ai_response": response.get('text', ''),
            "call_id": call_id
        }

    except Exception as e:
        logger.error("Error in test simulation", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test simulation failed: {str(e)}"
        )