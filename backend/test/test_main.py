"""Basic tests for the AI Calling Agent API."""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Import your app
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.app import app
from src.utils.config import get_settings

# Test settings
settings = get_settings()


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Async test client fixture."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
class TestHealthEndpoints:
    """Test health and status endpoints."""

    async def test_root_endpoint(self, async_client):
        """Test root endpoint."""
        response = await async_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == settings.api.title
        assert data["status"] == "running"

    async def test_health_check(self, async_client):
        """Test health check endpoint."""
        with patch('src.core.database.db_manager.get_session') as mock_session:
            # Mock successful database connection
            mock_db = AsyncMock()
            mock_session.return_value.__aenter__.return_value = mock_db
            mock_db.execute.return_value = None

            response = await async_client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert "status" in data
            assert "timestamp" in data

    async def test_metrics_endpoint(self, async_client):
        """Test metrics endpoint."""
        response = await async_client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "active_sessions" in data


@pytest.mark.asyncio
class TestCallAPI:
    """Test call management API endpoints."""

    @patch('src.core.call_service.call_service.create_call')
    @patch('src.core.database.db_manager.get_session')
    async def test_create_call(self, mock_session, mock_create_call, async_client):
        """Test call creation endpoint."""
        # Mock database session
        mock_db = AsyncMock()
        mock_session.return_value.__aenter__.return_value = mock_db

        # Mock call service
        mock_call = MagicMock()
        mock_call.id = "123e4567-e89b-12d3-a456-426614174000"
        mock_call.to_number = "+1234567890"
        mock_call.status = "queued"
        mock_call.created_at = "2024-01-01T00:00:00"
        mock_call.updated_at = "2024-01-01T00:00:00"
        mock_call.direction = "outbound"
        mock_call.from_number = "+0987654321"
        mock_call.contact_id = None
        mock_call.campaign_id = None
        mock_call.call_sid = None
        mock_call.duration_seconds = None
        mock_call.answered_at = None
        mock_call.ended_at = None
        mock_call.cost = None
        mock_call.transcript = None
        mock_call.conversation_summary = None
        mock_call.sentiment_score = None
        mock_call.intent_detected = None
        mock_call.error_message = None
        mock_call.started_at = None

        mock_create_call.return_value = mock_call

        call_data = {
            "to_number": "+1234567890",
            "script": "Hello, this is a test call"
        }

        response = await async_client.post("/api/v1/calls/", json=call_data)
        assert response.status_code == 201
        data = response.json()
        assert data["to_number"] == "+1234567890"
        assert data["status"] == "queued"

    async def test_create_call_invalid_phone(self, async_client):
        """Test call creation with invalid phone number."""
        call_data = {
            "to_number": "invalid-phone",  # Invalid format
            "script": "Hello, this is a test call"
        }

        response = await async_client.post("/api/v1/calls/", json=call_data)
        assert response.status_code == 422  # Validation error

    @patch('src.core.call_service.call_service.get_call_by_id')
    @patch('src.core.database.db_manager.get_session')
    async def test_get_call_not_found(self, mock_session, mock_get_call, async_client):
        """Test getting non-existent call."""
        mock_db = AsyncMock()
        mock_session.return_value.__aenter__.return_value = mock_db
        mock_get_call.return_value = None

        call_id = "123e4567-e89b-12d3-a456-426614174000"
        response = await async_client.get(f"/api/v1/calls/{call_id}")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestWebhooks:
    """Test Twilio webhook endpoints."""

    async def test_webhook_health(self, async_client):
        """Test webhook health check."""
        response = await async_client.get("/webhooks/twilio/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    @patch('src.core.session_manager.session_manager.create_session')
    @patch('src.core.session_manager.session_manager.handle_call_answered')
    @patch('src.core.call_service.call_service.get_call_by_id')
    @patch('src.core.database.db_manager.get_session')
    async def test_voice_webhook(self, mock_session, mock_get_call, mock_handle_answered, mock_create_session,
                                 async_client):
        """Test voice webhook handler."""
        mock_db = AsyncMock()
        mock_session.return_value.__aenter__.return_value = mock_db

        # Mock call
        mock_call = MagicMock()
        mock_call.contact_id = None
        mock_call.campaign_id = None
        mock_get_call.return_value = mock_call

        # Mock session manager
        mock_session_obj = MagicMock()
        mock_create_session.return_value = mock_session_obj
        mock_handle_answered.return_value = {
            'success': True,
            'text': 'Hello, how can I help you?',
            'next_phase': 'listening'
        }

        call_id = "123e4567-e89b-12d3-a456-426614174000"
        webhook_data = {
            "AccountSid": "test_account_sid",
            "CallSid": "test_call_sid",
            "CallStatus": "in-progress",
            "Direction": "outbound",
            "From": "+1234567890",
            "To": "+0987654321"
        }

        response = await async_client.post(f"/webhooks/twilio/voice/{call_id}", data=webhook_data)
        assert response.status_code == 200
        assert "text/xml" in response.headers["content-type"].lower()


@pytest.mark.asyncio
class TestServices:
    """Test service integrations."""

    @patch('src.stt.openai_stt.openai_stt.health_check')
    @patch('src.tts.openai_tts.openai_tts.health_check')
    @patch('src.nlp.openai_nlp.openai_nlp.health_check')
    async def test_service_health_checks(self, mock_nlp_health, mock_tts_health, mock_stt_health):
        """Test individual service health checks."""
        mock_stt_health.return_value = True
        mock_tts_health.return_value = True
        mock_nlp_health.return_value = True

        from src.stt.openai_stt import openai_stt
        from src.tts.openai_tts import openai_tts
        from src.nlp.openai_nlp import openai_nlp

        assert await openai_stt.health_check() == True
        assert await openai_tts.health_check() == True
        assert await openai_nlp.health_check() == True

    @patch('src.tts.openai_tts.openai_tts.synthesize_speech')
    async def test_tts_integration(self, mock_synthesize):
        """Test TTS service integration."""
        mock_synthesize.return_value = b"fake_audio_data"

        from src.tts.openai_tts import openai_tts

        audio_data = await openai_tts.synthesize_speech("Hello, world!")
        assert audio_data == b"fake_audio_data"
        mock_synthesize.assert_called_once_with("Hello, world!")

    @patch('src.nlp.openai_nlp.openai_nlp.initialize_conversation')
    async def test_nlp_integration(self, mock_init_conversation):
        """Test NLP service integration."""
        mock_init_conversation.return_value = {
            'text': 'Hello, how can I help you?',
            'emotion': 'friendly',
            'next_state': 'listening'
        }

        from src.nlp.openai_nlp import openai_nlp

        response = await openai_nlp.initialize_conversation("test-call-123")
        assert response['text'] == 'Hello, how can I help you?'
        assert response['emotion'] == 'friendly'


@pytest.mark.asyncio
class TestErrorHandling:
    """Test error handling across the application."""

    async def test_validation_error_handling(self, async_client):
        """Test that validation errors are handled properly."""
        # Send invalid JSON
        response = await async_client.post("/api/v1/calls/", json={})
        assert response.status_code == 422
        data = response.json()
        assert data["error"] == True
        assert data["code"] == "VALIDATION_ERROR"

    @patch('src.core.call_service.call_service.create_call')
    @patch('src.core.database.db_manager.get_session')
    async def test_database_error_handling(self, mock_session, mock_create_call, async_client):
        """Test database error handling."""
        from sqlalchemy.exc import SQLAlchemyError

        mock_db = AsyncMock()
        mock_session.return_value.__aenter__.return_value = mock_db
        mock_create_call.side_effect = SQLAlchemyError("Database connection failed")

        call_data = {"to_number": "+1234567890"}
        response = await async_client.post("/api/v1/calls/", json=call_data)
        assert response.status_code == 500
        data = response.json()
        assert data["error"] == True
        assert data["code"] == "DATABASE_ERROR"


# Integration test for the full call flow
@pytest.mark.asyncio
@pytest.mark.integration
class TestCallFlow:
    """Integration tests for complete call flow."""

    @patch('src.telephony.twilio_client.twilio_client.make_call')
    @patch('src.core.database.db_manager.get_session')
    async def test_end_to_end_call_creation(self, mock_session, mock_twilio_call, async_client):
        """Test complete call creation and initiation flow."""
        # Mock database
        mock_db = AsyncMock()
        mock_session.return_value.__aenter__.return_value = mock_db

        # Mock Twilio response
        mock_twilio_call.return_value = {
            'call_sid': 'test_call_sid_123',
            'status': 'ringing',
            'direction': 'outbound',
            'from': '+1234567890',
            'to': '+0987654321',
            'start_time': None,
            'price': None,
            'price_unit': None
        }

        # Create call
        call_data = {
            "to_number": "+0987654321",
            "script": "Hello, this is a test call from our AI system."
        }

        with patch('src.core.call_service.call_service.create_call') as mock_create, \
                patch('src.core.call_service.call_service.initiate_call') as mock_initiate:
            # Mock call object
            mock_call = MagicMock()
            mock_call.id = "123e4567-e89b-12d3-a456-426614174000"
            mock_call.to_number = "+0987654321"
            mock_call.status = "ringing"
            mock_call.call_sid = "test_call_sid_123"

            mock_create.return_value = mock_call
            mock_initiate.return_value = mock_call

            # Test immediate call creation
            response = await async_client.post("/api/v1/calls/make", json=call_data)
            assert response.status_code == 200
            data = response.json()
            assert data["to_number"] == "+0987654321"
            assert data["call_sid"] == "test_call_sid_123"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])