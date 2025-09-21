"""Configuration management using Pydantic Settings."""

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """Database configuration."""
    url: str = Field(alias="DATABASE_URL")
    test_url: Optional[str] = Field(None, alias="DATABASE_TEST_URL")
    echo: bool = Field(False, description="Echo SQL queries")
    pool_size: int = Field(10, description="Database connection pool size")
    max_overflow: int = Field(20, description="Max overflow connections")


class RedisSettings(BaseSettings):
    """Redis configuration."""
    url: str = Field(alias="REDIS_URL")
    session_db: int = Field(1, alias="REDIS_SESSION_DB")
    max_connections: int = Field(20)


class TwilioSettings(BaseSettings):
    """Twilio configuration."""
    account_sid: str = Field(alias="TWILIO_ACCOUNT_SID")
    auth_token: str = Field(alias="TWILIO_AUTH_TOKEN")
    phone_number: str = Field(alias="TWILIO_PHONE_NUMBER")
    webhook_base_url: Optional[str] = Field(None, description="Base URL for webhooks")


class APISettings(BaseSettings):
    """API server configuration."""
    host: str = Field("0.0.0.0", alias="API_HOST")
    port: int = Field(8000, alias="API_PORT")
    debug: bool = Field(False, alias="API_DEBUG")
    secret_key: str = Field(alias="API_SECRET_KEY")
    title: str = Field("AI Calling Agent API")
    version: str = Field("1.0.0")


class CelerySettings(BaseSettings):
    """Celery configuration."""
    broker_url: str = Field(alias="CELERY_BROKER_URL")
    result_backend: str = Field(alias="CELERY_RESULT_BACKEND")
    task_serializer: str = Field("json")
    result_serializer: str = Field("json")
    timezone: str = Field("UTC")


class LoggingSettings(BaseSettings):
    """Logging configuration."""
    level: str = Field("INFO", alias="LOG_LEVEL")
    format: str = Field("json", alias="LOG_FORMAT")


class ExternalAPISettings(BaseSettings):
    """External API keys."""
    openai_api_key: Optional[str] = Field(None, alias="OPENAI_API_KEY")
    elevenlabs_api_key: Optional[str] = Field(None, alias="ELEVENLABS_API_KEY")


class Settings(BaseSettings):
    """Main application settings."""

    model_config = SettingsConfigDict(
        env_file=".env.template",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Sub-configurations
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    redis: RedisSettings = Field(default_factory=RedisSettings)
    twilio: TwilioSettings = Field(default_factory=TwilioSettings)
    api: APISettings = Field(default_factory=APISettings)
    celery: CelerySettings = Field(default_factory=CelerySettings)
    logging: LoggingSettings = Field(default_factory=LoggingSettings)
    external_apis: ExternalAPISettings = Field(default_factory=ExternalAPISettings)

    # Environment
    environment: str = Field("development", description="Environment name")
    testing: bool = Field(False, description="Testing mode")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()