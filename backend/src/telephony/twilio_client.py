"""Twilio telephony client for call management."""

import asyncio
from typing import Dict, Optional, Any
from datetime import datetime

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import httpx

from ..utils.config import get_settings
from ..utils.logger import LoggerMixin
from ..utils.exceptions import TwilioError

settings = get_settings()


class TwilioClient(LoggerMixin):
    """Twilio client for managing phone calls."""

    def __init__(self):
        self.client = Client(
            settings.twilio.account_sid,
            settings.twilio.auth_token
        )
        self.phone_number = settings.twilio.phone_number
        self.webhook_base_url = settings.twilio.webhook_base_url

    async def make_call(
            self,
            to_number: str,
            call_id: str,
            script_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate an outbound call via Twilio.

        Args:
            to_number: Phone number to call
            call_id: Internal call ID for tracking
            script_url: URL for TwiML instructions (optional)

        Returns:
            Twilio call response data
        """
        try:
            # Default TwiML URL points to our voice webhook
            twiml_url = script_url or f"{self.webhook_base_url}/webhooks/twilio/voice/{call_id}"

            # Status callback URL for call events
            status_callback_url = f"{self.webhook_base_url}/webhooks/twilio/status/{call_id}"

            call = self.client.calls.create(
                to=to_number,
                from_=self.phone_number,
                url=twiml_url,
                status_callback=status_callback_url,
                status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                status_callback_method='POST',
                record=True,  # Record calls for analysis
                timeout=30,   # Ring timeout in seconds
                machine_detection='Enable',
                machine_detection_timeout=5,
            )

            self.logger.info(
                "Twilio call initiated",
                call_sid=call.sid,
                to_number=to_number,
                call_id=call_id
            )

            return {
                'call_sid': call.sid,
                'status': call.status,
                'direction': call.direction,
                'from': call.from_,
                'to': call.to,
                'start_time': call.start_time,
                'price': call.price,
                'price_unit': call.price_unit
            }

        except TwilioRestException as e:
            self.logger.error(
                "Twilio call failed",
                error_code=e.code,
                error_message=e.msg,
                to_number=to_number
            )
            raise TwilioError(f"Twilio call failed: {e.msg}", code=str(e.code))

        except Exception as e:
            self.logger.error("Unexpected error making Twilio call", error=str(e))
            raise TwilioError(f"Failed to make call: {str(e)}")

    async def hangup_call(self, call_sid: str) -> Dict[str, Any]:
        """
        Hangup an active call.

        Args:
            call_sid: Twilio call SID

        Returns:
            Updated call data
        """
        try:
            call = self.client.calls(call_sid).update(status='completed')

            self.logger.info(
                "Twilio call hangup successful",
                call_sid=call_sid,
                status=call.status
            )

            return {
                'call_sid': call.sid,
                'status': call.status,
                'end_time': call.end_time,
                'duration': call.duration,
                'price': call.price
            }

        except TwilioRestException as e:
            self.logger.error(
                "Twilio hangup failed",
                call_sid=call_sid,
                error_code=e.code,
                error_message=e.msg
            )
            raise TwilioError(f"Failed to hangup call: {e.msg}")

    async def get_call_status(self, call_sid: str) -> Dict[str, Any]:
        """
        Get current call status from Twilio.

        Args:
            call_sid: Twilio call SID

        Returns:
            Current call status data
        """
        try:
            call = self.client.calls(call_sid).fetch()

            return {
                'call_sid': call.sid,
                'status': call.status,
                'direction': call.direction,
                'from': call.from_,
                'to': call.to,
                'start_time': call.start_time.isoformat() if call.start_time else None,
                'end_time': call.end_time.isoformat() if call.end_time else None,
                'duration': call.duration,
                'price': call.price,
                'price_unit': call.price_unit,
                'answered_by': getattr(call, 'answered_by', None)
            }

        except TwilioRestException as e:
            self.logger.error(
                "Failed to get call status",
                call_sid=call_sid,
                error_code=e.code,
                error_message=e.msg
            )
            raise TwilioError(f"Failed to get call status: {e.msg}")

    async def get_call_recordings(self, call_sid: str) -> list:
        """Get recordings for a call."""
        try:
            recordings = self.client.recordings.list(call_sid=call_sid)

            return [
                {
                    'sid': rec.sid,
                    'uri': rec.uri,
                    'duration': rec.duration,
                    'date_created': rec.date_created.isoformat() if rec.date_created else None,
                    'channels': rec.channels,
                    'source': rec.source
                }
                for rec in recordings
            ]

        except TwilioRestException as e:
            self.logger.error(
                "Failed to get call recordings",
                call_sid=call_sid,
                error=str(e)
            )
            return []

    def generate_twiml_response(
            self,
            message: str,
            voice: str = "neural",
            language: str = "en-US"
    ) -> str:
        """
        Generate TwiML response for voice synthesis.

        Args:
            message: Text to speak
            voice: Voice type
            language: Language code

        Returns:
            TwiML XML string
        """
        # For OpenAI TTS integration, we'll stream audio
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}" language="{language}">{message}</Say>
    <Gather input="speech" timeout="10" speechTimeout="2" action="/webhooks/twilio/gather" method="POST">
        <Say voice="{voice}">Please speak your response.</Say>
    </Gather>
    <Say voice="{voice}">I didn't hear anything. Goodbye.</Say>
    <Hangup/>
</Response>"""
        return twiml

    def generate_streaming_twiml(self, stream_url: str) -> str:
        """Generate TwiML for real-time audio streaming."""
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="{stream_url}" />
    </Connect>
</Response>"""
        return twiml


# Global Twilio client instance
twilio_client = TwilioClient()