"""Pytest configuration and fixtures."""

import pytest
import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock
from typing import AsyncGenerator

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set test environment
os.environ['TESTING'] = 'true'
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///test.db'
os.environ['REDIS_URL'] = 'redis://localhost:6379/15'  # Test database

pytest_plugins = ('pytest_asyncio',)


@pytest.fixture(scope='session')
def event_loop():
    """Create event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def mock_db_session():
    """Mock database session."""
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.refresh = AsyncMock()
    session.scalar = AsyncMock()
    session.execute = AsyncMock()
    session.close = AsyncMock()
    return session


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    from src.utils.config import Settings

    settings = Settings()
    settings.testing = True
    settings.api.debug = True
    settings.database.url = 'sqlite+aiosqlite:///test.db'
    settings.external_apis.openai_api_key = 'test-openai-key'
    settings.twilio.account_sid = 'test-twilio-sid'
    settings.twilio.auth_token = 'test-twilio-token'
    settings.twilio.phone_number = '+1234567890'

    return settings


@pytest.fixture
def mock_call():
    """Mock call object."""
    call = MagicMock()
    call.id = '123e4567-e89b-12d3-a456-426614174000'
    call.call_sid = 'test_call_sid'
    call.to_number = '+1234567890'
    call.from_number = '+0987654321'
    call.status = 'queued'
    call.direction = 'outbound'
    call.contact_id = None
    call.campaign_id = None
    call.duration_seconds = None
    call.answered_at = None
    call.ended_at = None
    call.cost = None
    call.transcript = None
    call.conversation_summary = None
    call.sentiment_score = None
    call.intent_detected = None
    call.error_message = None
    call.created_at = '2024-01-01T00:00:00'
    call.updated_at = '2024-01-01T00:00:00'
    call.started_at = None

    return call


@pytest.fixture
def mock_contact():
    """Mock contact object."""
    contact = MagicMock()
    contact.id = '123e4567-e89b-12d3-a456-426614174001'
    contact.phone_number = '+1234567890'
    contact.first_name = 'John'
    contact.last_name = 'Doe'
    contact.email = 'john.doe@example.com'
    contact.metadata = {}
    contact.created_at = '2024-01-01T00:00:00'
    contact.updated_at = '2024-01-01T00:00:00'

    return contact


@pytest.fixture
def mock_campaign():
    """Mock campaign object."""
    campaign = MagicMock()
    campaign.id = '123e4567-e89b-12d3-a456-426614174002'
    campaign.name = 'Test Campaign'
    campaign.description = 'Test campaign description'
    campaign.status = 'draft'
    campaign.script = 'Hello, this is a test call.'
    campaign.max_concurrent_calls = 5
    campaign.retry_attempts = 3
    campaign.total_contacts = 0
    campaign.calls_completed = 0
    campaign.calls_failed = 0
    campaign.created_at = '2024-01-01T00:00:00'
    campaign.updated_at = '2024-01-01T00:00:00'

    return campaign


@pytest.fixture
def sample_call_data():
    """Sample call data for testing."""
    return {
        'to_number': '+1234567890',
        'script': 'Hello, this is a test call.',
        'contact_id': None,
        'campaign_id': None,
        'metadata': {}
    }


@pytest.fixture
def sample_webhook_data():
    """Sample Twilio webhook data."""
    return {
        'AccountSid': 'test_account_sid',
        'CallSid': 'test_call_sid',
        'CallStatus': 'in-progress',
        'Direction': 'outbound',
        'From': '+1234567890',
        'To': '+0987654321',
        'CallerName': None,
        'ForwardedFrom': None,
        'CallerCity': None,
        'CallerState': None,
        'CallerZip': None,
        'CallerCountry': None
    }


@pytest.fixture
async def mock_session_manager():
    """Mock session manager."""
    from src.core.session_manager import SessionManager, CallSession

    session_manager = SessionManager()

    # Mock methods
    session_manager.create_session = AsyncMock()
    session_manager.handle_call_answered = AsyncMock()
    session_manager.handle_speech_input = AsyncMock()
    session_manager.handle_call_ended = AsyncMock()
    session_manager.get_session = MagicMock()
    session_manager.get_active_sessions_count = MagicMock(return_value=0)
    session_manager.get_active_sessions_info = MagicMock(return_value=[])

    return session_manager


@pytest.fixture
async def mock_openai_services():
    """Mock all OpenAI services."""

    # Mock STT
    mock_stt = AsyncMock()
    mock_stt.transcribe_audio.return_value = {
        'text': 'Hello, how are you?',
        'confidence': 0.95,
        'language': 'en',
        'duration': 2.5
    }
    mock_stt.health_check.return_value = True

    # Mock TTS
    mock_tts = AsyncMock()
    mock_tts.synthesize_speech.return_value = b'fake_audio_data'
    mock_tts.synthesize_with_emotions.return_value = b'fake_emotional_audio_data'
    mock_tts.health_check.return_value = True

    # Mock NLP
    mock_nlp = AsyncMock()
    mock_nlp.initialize_conversation.return_value = {
        'text': 'Hello, how can I help you today?',
        'emotion': 'friendly',
        'next_state': 'listening',
        'should_end_call': False,
        'should_transfer': False,
        'confidence': 0.9
    }
    mock_nlp.process_conversation_turn.return_value = {
        'text': 'I understand. How can I help you with that?',
        'emotion': 'helpful',
        'next_state': 'listening',
        'intent': 'question',
        'sentiment': 'neutral',
        'confidence': 0.85,
        'should_end_call': False,
        'should_transfer': False
    }
    mock_nlp.health_check.return_value = True

    return {
        'stt': mock_stt,
        'tts': mock_tts,
        'nlp': mock_nlp
    }


@pytest.fixture
async def mock_twilio_client():
    """Mock Twilio client."""
    mock_client = AsyncMock()

    mock_client.make_call.return_value = {
        'call_sid': 'test_call_sid_123',
        'status': 'ringing',
        'direction': 'outbound',
        'from': '+1234567890',
        'to': '+0987654321',
        'start_time': None,
        'price': None,
        'price_unit': None
    }

    mock_client.hangup_call.return_value = {
        'call_sid': 'test_call_sid_123',
        'status': 'completed',
        'end_time': '2024-01-01T00:05:00',
        'duration': 300,
        'price': '-0.02'
    }

    mock_client.get_call_status.return_value = {
        'call_sid': 'test_call_sid_123',
        'status': 'completed',
        'direction': 'outbound',
        'from': '+1234567890',
        'to': '+0987654321',
        'start_time': '2024-01-01T00:00:00',
        'end_time': '2024-01-01T00:05:00',
        'duration': '300',
        'price': '-0.02',
        'price_unit': 'USD',
        'answered_by': None
    }

    return mock_client


@pytest.fixture
async def mock_crm_integration():
    """Mock CRM integration."""
    from src.integrations.crm_integration import BaseCRMIntegration

    mock_crm = AsyncMock(spec=BaseCRMIntegration)

    mock_crm.get_contact.return_value = {
        'id': 'crm_contact_123',
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john.doe@example.com',
        'phone': '+1234567890',
        'company': 'Test Company',
        'source': 'mock_crm'
    }

    mock_crm.create_contact.return_value = {
        'id': 'crm_contact_456',
        'created_at': '2024-01-01T00:00:00',
        'source': 'mock_crm'
    }

    mock_crm.create_call_log.return_value = {
        'id': 'crm_call_log_789',
        'created_at': '2024-01-01T00:00:00'
    }

    mock_crm.health_check.return_value = True

    return mock_crm


# Cleanup fixtures
@pytest.fixture(autouse=True)
async def cleanup_test_data():
    """Clean up any test data after each test."""
    yield
    # Cleanup code would go here
    # For example, clearing test database, removing temp files, etc.


# Performance testing fixtures
@pytest.fixture
def benchmark_call_data():
    """Generate benchmark data for performance tests."""
    return {
        'call_count': 100,
        'concurrent_calls': 10,
        'test_duration_seconds': 60,
        'sample_audio_size': 1024 * 10  # 10KB
    }


# Integration test markers
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "external: mark test as requiring external services"
    )


# Skip markers for CI/CD
def pytest_collection_modifyitems(config, items):
    """Modify test collection to skip certain tests in CI."""
    if config.getoption("--ci"):
        skip_external = pytest.mark.skip(reason="External services not available in CI")
        for item in items:
            if "external" in item.keywords:
                item.add_marker(skip_external)


def pytest_addoption(parser):
    """Add custom command line options."""
    parser.addoption(
        "--ci",
        action="store_true",
        default=False,
        help="Run in CI mode (skip external service tests)"
    )
    parser.addoption(
        "--integration",
        action="store_true",
        default=False,
        help="Run integration tests"
    )