"""Configuration management using Pydantic Settings."""

from functools import lru_cache
from typing import Optional, List
import os

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """Database configuration."""
    url: str = Field(default="sqlite+aiosqlite:///./aiagent.db", alias="DATABASE_URL")
    test_url: Optional[str] = Field(None, alias="DATABASE_TEST_URL")
    echo: bool = Field(False, description="Echo SQL queries")
    pool_size: int = Field(10, description="Database connection pool size")
    max_overflow: int = Field(20, description="Max overflow connections")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class JWTSettings(BaseSettings):
    """JWT configuration."""
    secret_key: str = Field(
        default="dev-secret-key-change-in-production-min-32-characters",
        alias="JWT_SECRET_KEY"
    )
    algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    expiration_hours: int = Field(24, alias="JWT_EXPIRATION_HOURS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class RedisSettings(BaseSettings):
    """Redis configuration."""
    url: Optional[str] = Field(None, alias="REDIS_URL")
    session_db: int = Field(1, alias="REDIS_SESSION_DB")
    max_connections: int = Field(20)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class TwilioSettings(BaseSettings):
    """Twilio configuration."""
    account_sid: str = Field(default="", alias="TWILIO_ACCOUNT_SID")
    auth_token: str = Field(default="", alias="TWILIO_AUTH_TOKEN")
    phone_number: str = Field(default="", alias="TWILIO_PHONE_NUMBER")
    webhook_base_url: Optional[str] = Field(None, description="Base URL for webhooks")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class APISettings(BaseSettings):
    """API server configuration."""
    host: str = Field("0.0.0.0", alias="API_HOST")
    port: int = Field(8000, alias="API_PORT")
    debug: bool = Field(False, alias="DEBUG")
    title: str = Field("AI Calling Agent API")
    version: str = Field("1.0.0", alias="API_VERSION")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class LoggingSettings(BaseSettings):
    """Logging configuration."""
    level: str = Field("INFO", alias="LOG_LEVEL")
    format: str = Field("json", alias="LOG_FORMAT")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class ExternalAPISettings(BaseSettings):
    """External API keys."""
    openai_api_key: Optional[str] = Field(None, alias="OPENAI_API_KEY")
    elevenlabs_api_key: Optional[str] = Field(None, alias="ELEVENLABS_API_KEY")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


class Settings(BaseSettings):
    """Main application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Environment
    environment: str = Field("development", alias="ENVIRONMENT")
    testing: bool = Field(False)
    debug: bool = Field(False, alias="DEBUG")

    # Sub-configurations
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    jwt: JWTSettings = Field(default_factory=JWTSettings)
    redis: Optional[RedisSettings] = Field(default=None)
    twilio: TwilioSettings = Field(default_factory=TwilioSettings)
    api: APISettings = Field(default_factory=APISettings)
    logging: LoggingSettings = Field(default_factory=LoggingSettings)
    external_apis: ExternalAPISettings = Field(default_factory=ExternalAPISettings)
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        alias="CORS_ORIGINS"
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS if it's a string
        cors_env = os.getenv("CORS_ORIGINS")
        if cors_env:
            self.cors_origins = [origin.strip() for origin in cors_env.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    try:
        settings = Settings()
        return settings
    except Exception as e:
        print(f"Error loading settings: {str(e)}")
        # Return defaults if loading fails
        return Settings()