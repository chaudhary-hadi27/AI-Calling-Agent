"""Session manager for orchestrating call flows."""

import asyncio
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from enum import Enum

from sqlalchemy.ext.asyncio import AsyncSession

from ..telephony.twilio_client import twilio_client
from ..stt.openai_stt import openai_stt
from ..tts.openai_tts import openai_tts
from ..nlp.openai_nlp import openai_nlp, ConversationState
from ..core.database import db_manager, Call, CallLog, CallStatus
from ..core.call_service import call_service
from ..utils.logger import LoggerMixin
from ..utils.exceptions import SessionError, SessionNotFoundError


class SessionPhase(str, Enum):
    """Call session phases."""
    INITIALIZING = "initializing"
    GREETING = "greeting"
    CONVERSATION = "conversation"
    PROCESSING_SPEECH = "processing_speech"
    GENERATING_RESPONSE = "generating_response"
    SPEAKING = "speaking"
    LISTENING = "listening"
    TRANSFERRING = "transferring"
    ENDING = "ending"
    COMPLETED = "completed"
    ERROR = "error"


class CallSession:
    """Individual call session state."""

    def __init__(self, call_id: str, call_data: Dict[str, Any]):
        self.call_id = call_id
        self.call_sid = call_data.get('call_sid')
        self.phone_number = call_data.get('to_number')
        self.contact_id = call_data.get('contact_id')
        self.campaign_id = call_data.get('campaign_id')

        # Session state
        self.phase = SessionPhase.INITIALIZING
        self.conversation_state = ConversationState.GREETING
        self.started_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()

        # Audio processing
        self.current_audio_buffer = b''
        self.is_speaking = False
        self.is_listening = False
        self.speech_timeout = 3.0  # Seconds of silence before processing

        # Context and memory
        self.context = call_data.get('context', {})
        self.conversation_log = []
        self.error_count = 0
        self.max_errors = 3


class SessionManager(LoggerMixin):
    """Manages active call sessions and orchestrates conversation flow."""

    def __init__(self):
        self.active_sessions: Dict[str, CallSession] = {}
        self.session_cleanup_task = None

    async def create_session(
            self,
            call_id: str,
            call_data: Dict[str, Any]
    ) -> CallSession:
        """Create and initialize a new call session."""
        try:
            session = CallSession(call_id, call_data)
            self.active_sessions[call_id] = session

            # Initialize conversation context
            contact_info = await self._get_contact_info(session.contact_id) if session.contact_id else {}
            campaign_info = await self._get_campaign_info(session.campaign_id) if session.campaign_id else {}

            session.context.update({
                'contact_name': contact_info.get('first_name', ''),
                'campaign_type': campaign_info.get('type', 'sales'),
                'script': campaign_info.get('script', ''),
                'contact_info': contact_info,
                'campaign_info': campaign_info
            })

            self.logger.info(
                "Call session created",
                call_id=call_id,
                phone_number=session.phone_number,
                contact_id=session.contact_id
            )

            return session

        except Exception as e:
            self.logger.error("Failed to create session", call_id=call_id, error=str(e))
            raise SessionError(f"Failed to create session: {str(e)}")

    async def handle_call_answered(self, call_id: str) -> Dict[str, Any]:
        """Handle when call is answered - start conversation."""
        try:
            session = self.get_session(call_id)
            session.phase = SessionPhase.GREETING
            session.is_listening = True

            # Initialize conversation and generate greeting
            greeting_response = await openai_nlp.initialize_conversation(
                call_id=call_id,
                context=session.context
            )

            # Generate greeting audio
            audio_data = await openai_tts.synthesize_with_emotions(
                text=greeting_response['text'],
                emotion=greeting_response['emotion'],
                voice="nova",
                speed=0.9
            )

            # Log the interaction
            await self._log_interaction(
                session=session,
                event_type="greeting",
                direction="outbound",
                content=greeting_response['text'],
                metadata={'emotion': greeting_response['emotion']}
            )

            session.phase = SessionPhase.SPEAKING
            session.conversation_state = greeting_response['next_state']

            return {
                'success': True,
                'audio_data': audio_data,
                'text': greeting_response['text'],
                'next_phase': SessionPhase.LISTENING
            }

        except Exception as e:
            return await self._handle_session_error(call_id, e)

    async def handle_speech_input(
            self,
            call_id: str,
            audio_data: bytes,
            is_final: bool = True
    ) -> Dict[str, Any]:
        """Process incoming speech from caller."""
        try:
            session = self.get_session(call_id)
            session.last_activity = datetime.utcnow()

            if session.phase != SessionPhase.LISTENING:
                return {'success': True, 'message': 'Not in listening phase'}

            session.phase = SessionPhase.PROCESSING_SPEECH

            # Transcribe audio
            transcription = await openai_stt.transcribe_audio(
                audio_data=audio_data,
                language='en',  # You could detect language dynamically
                prompt=session.context.get('script', '')
            )

            if not transcription['text'].strip():
                session.phase = SessionPhase.LISTENING
                return {'success': True, 'message': 'No speech detected'}

            # Log the user input
            await self._log_interaction(
                session=session,
                event_type="speech",
                direction="inbound",
                content=transcription['text'],
                confidence_score=transcription['confidence']
            )

            # Process conversation turn
            session.phase = SessionPhase.GENERATING_RESPONSE
            response_data = await openai_nlp.process_conversation_turn(
                call_id=call_id,
                user_input=transcription['text'],
                context=session.context
            )

            # Generate response audio
            audio_response = await openai_tts.synthesize_with_emotions(
                text=response_data['text'],
                emotion=response_data['emotion'],
                voice="nova",
                speed=0.9
            )

            # Log the response
            await self._log_interaction(
                session=session,
                event_type="response",
                direction="outbound",
                content=response_data['text'],
                metadata={
                    'emotion': response_data['emotion'],
                    'intent': response_data['intent'],
                    'sentiment': response_data['sentiment']
                }
            )

            # Update session state
            session.phase = SessionPhase.SPEAKING
            session.conversation_state = response_data['conversation_state']

            # Handle special cases
            if response_data.get('should_end_call'):
                session.phase = SessionPhase.ENDING
            elif response_data.get('should_transfer'):
                session.phase = SessionPhase.TRANSFERRING

            return {
                'success': True,
                'audio_data': audio_response,
                'text': response_data['text'],
                'transcription': transcription['text'],
                'intent': response_data['intent'],
                'should_end_call': response_data.get('should_end_call', False),
                'should_transfer': response_data.get('should_transfer', False),
                'next_phase': SessionPhase.LISTENING if not response_data.get(
                    'should_end_call') else SessionPhase.ENDING
            }

        except Exception as e:
            return await self._handle_session_error(call_id, e)

    async def handle_speech_completed(self, call_id: str) -> None:
        """Handle when AI finishes speaking."""
        try:
            session = self.get_session(call_id)
            session.phase = SessionPhase.LISTENING
            session.is_speaking = False
            session.is_listening = True

            self.logger.debug("Session now listening", call_id=call_id)

        except Exception as e:
            self.logger.error("Error handling speech completion", call_id=call_id, error=str(e))

    async def handle_call_ended(self, call_id: str, reason: str = "completed") -> Dict[str, Any]:
        """Handle call termination."""
        try:
            session = self.get_session(call_id)
            session.phase = SessionPhase.COMPLETED

            # Generate conversation summary
            summary = await openai_nlp.get_conversation_summary(call_id)

            # Update database with final call data
            async with db_manager.get_session() as db_session:
                await self._update_call_completion(
                    db_session=db_session,
                    session=session,
                    summary=summary,
                    reason=reason
                )

            # Cleanup session
            await self._cleanup_session(call_id)

            self.logger.info(
                "Call session ended",
                call_id=call_id,
                reason=reason,
                duration=datetime.utcnow() - session.started_at
            )

            return {
                'success': True,
                'summary': summary,
                'duration_seconds': (datetime.utcnow() - session.started_at).total_seconds()
            }

        except Exception as e:
            self.logger.error("Error ending call session", call_id=call_id, error=str(e))
            return {'success': False, 'error': str(e)}

    def get_session(self, call_id: str) -> CallSession:
        """Get active session by call ID."""
        session = self.active_sessions.get(call_id)
        if not session:
            raise SessionNotFoundError(f"Session {call_id} not found")
        return session

    async def _log_interaction(
            self,
            session: CallSession,
            event_type: str,
            direction: str,
            content: str,
            confidence_score: Optional[float] = None,
            metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log interaction to database."""
        try:
            async with db_manager.get_session() as db_session:
                call = await call_service.get_call_by_id(db_session, uuid.UUID(session.call_id))
                if call:
                    log_entry = CallLog(
                        call_id=call.id,
                        sequence=len(session.conversation_log),
                        event_type=event_type,
                        direction=direction,
                        content=content,
                        confidence_score=confidence_score,
                        metadata=metadata,
                        timestamp=datetime.utcnow()
                    )

                    db_session.add(log_entry)
                    await db_session.commit()

                    session.conversation_log.append({
                        'event_type': event_type,
                        'direction': direction,
                        'content': content,
                        'timestamp': datetime.utcnow().isoformat()
                    })

        except Exception as e:
            self.logger.error("Failed to log interaction", error=str(e))

    async def _handle_session_error(self, call_id: str, error: Exception) -> Dict[str, Any]:
        """Handle session errors with recovery attempts."""
        try:
            session = self.get_session(call_id)
            session.error_count += 1
            session.phase = SessionPhase.ERROR

            self.logger.error(
                "Session error occurred",
                call_id=call_id,
                error=str(error),
                error_count=session.error_count
            )

            if session.error_count >= session.max_errors:
                # Too many errors, end call
                await self.handle_call_ended(call_id, reason="error_limit_exceeded")
                return {
                    'success': False,
                    'should_end_call': True,
                    'error': 'Maximum errors exceeded'
                }

            # Generate error recovery response
            recovery_audio = await openai_tts.synthesize_speech(
                text="I apologize, I'm having trouble hearing you. Could you please repeat that?",
                voice="nova"
            )

            session.phase = SessionPhase.LISTENING

            return {
                'success': False,
                'audio_data': recovery_audio,
                'error': str(error),
                'recovery_attempt': True
            }

        except Exception as e:
            self.logger.error("Error in error handling", call_id=call_id, error=str(e))
            return {
                'success': False,
                'should_end_call': True,
                'error': 'Critical session error'
            }

    async def _get_contact_info(self, contact_id: uuid.UUID) -> Dict[str, Any]:
        """Fetch contact information from database."""
        try:
            async with db_manager.get_session() as session:
                from sqlalchemy import select
                from ..core.database import Contact

                query = select(Contact).where(Contact.id == contact_id)
                contact = await session.scalar(query)

                if contact:
                    return {
                        'first_name': contact.first_name,
                        'last_name': contact.last_name,
                        'email': contact.email,
                        'phone_number': contact.phone_number,
                        'metadata': contact.metadata or {}
                    }
                return {}
        except Exception as e:
            self.logger.error("Failed to fetch contact info", contact_id=contact_id, error=str(e))
            return {}

    async def _get_campaign_info(self, campaign_id: uuid.UUID) -> Dict[str, Any]:
        """Fetch campaign information from database."""
        try:
            async with db_manager.get_session() as session:
                from sqlalchemy import select
                from ..core.database import Campaign

                query = select(Campaign).where(Campaign.id == campaign_id)
                campaign = await session.scalar(query)

                if campaign:
                    return {
                        'name': campaign.name,
                        'description': campaign.description,
                        'script': campaign.script,
                        'type': 'sales'  # You can add campaign type to database later
                    }
                return {}
        except Exception as e:
            self.logger.error("Failed to fetch campaign info", campaign_id=campaign_id, error=str(e))
            return {}

    async def _update_call_completion(
            self,
            db_session: AsyncSession,
            session: CallSession,
            summary: Optional[Dict[str, Any]],
            reason: str
    ) -> None:
        """Update call record with completion data."""
        try:
            call = await call_service.get_call_by_id(db_session, uuid.UUID(session.call_id))
            if call:
                call.status = CallStatus.COMPLETED
                call.ended_at = datetime.utcnow()
                call.duration_seconds = int((datetime.utcnow() - session.started_at).total_seconds())

                if summary:
                    call.conversation_summary = summary.get('notes', '')
                    call.sentiment_score = self._sentiment_to_score(summary.get('customer_sentiment', 'neutral'))
                    call.intent_detected = summary.get('outcome', 'completed')

                await db_session.commit()

        except Exception as e:
            self.logger.error("Failed to update call completion", error=str(e))

    def _sentiment_to_score(self, sentiment: str) -> float:
        """Convert sentiment to numerical score."""
        mapping = {
            'positive': 0.8,
            'neutral': 0.0,
            'negative': -0.8
        }
        return mapping.get(sentiment.lower(), 0.0)

    async def _cleanup_session(self, call_id: str) -> None:
        """Clean up session resources."""
        try:
            if call_id in self.active_sessions:
                del self.active_sessions[call_id]
                self.logger.debug("Session cleaned up", call_id=call_id)
        except Exception as e:
            self.logger.error("Error cleaning up session", call_id=call_id, error=str(e))

    async def get_session_status(self, call_id: str) -> Dict[str, Any]:
        """Get current session status."""
        try:
            session = self.get_session(call_id)
            return {
                'call_id': call_id,
                'phase': session.phase,
                'conversation_state': session.conversation_state,
                'is_speaking': session.is_speaking,
                'is_listening': session.is_listening,
                'error_count': session.error_count,
                'started_at': session.started_at.isoformat(),
                'last_activity': session.last_activity.isoformat(),
                'conversation_turns': len(session.conversation_log)
            }
        except SessionNotFoundError:
            return {'error': 'Session not found'}

    async def start_session_cleanup_task(self) -> None:
        """Start background task to clean up inactive sessions."""
        if not self.session_cleanup_task:
            self.session_cleanup_task = asyncio.create_task(self._session_cleanup_loop())

    async def stop_session_cleanup_task(self) -> None:
        """Stop session cleanup task."""
        if self.session_cleanup_task:
            self.session_cleanup_task.cancel()
            try:
                await self.session_cleanup_task
            except asyncio.CancelledError:
                pass
            self.session_cleanup_task = None

    async def _session_cleanup_loop(self) -> None:
        """Background loop to clean up inactive sessions."""
        while True:
            try:
                current_time = datetime.utcnow()
                sessions_to_cleanup = []

                for call_id, session in self.active_sessions.items():
                    # Clean up sessions inactive for more than 30 minutes
                    if (current_time - session.last_activity).total_seconds() > 1800:
                        sessions_to_cleanup.append(call_id)

                for call_id in sessions_to_cleanup:
                    self.logger.info("Cleaning up inactive session", call_id=call_id)
                    await self.handle_call_ended(call_id, reason="timeout")

                await asyncio.sleep(300)  # Check every 5 minutes

            except asyncio.CancelledError:
                break
            except Exception as e:
                self.logger.error("Error in session cleanup loop", error=str(e))
                await asyncio.sleep(60)

    def get_active_sessions_count(self) -> int:
        """Get count of active sessions."""
        return len(self.active_sessions)

    def get_active_sessions_info(self) -> List[Dict[str, Any]]:
        """Get information about all active sessions."""
        return [
            {
                'call_id': call_id,
                'phone_number': session.phone_number,
                'phase': session.phase,
                'started_at': session.started_at.isoformat(),
                'duration_seconds': (datetime.utcnow() - session.started_at).total_seconds()
            }
            for call_id, session in self.active_sessions.items()
        ]


# Global session manager instance
session_manager = SessionManager()