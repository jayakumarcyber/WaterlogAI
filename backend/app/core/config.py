from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicPulse Monsoon API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Authoritative Chennai Geographic Coordinates (Single Source of Truth)
    CHENNAI_LATITUDE: float = 13.0827
    CHENNAI_LONGITUDE: float = 80.2707
    CHENNAI_TIMEZONE: str = "Asia/Kolkata"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "civicpulse"
    POSTGRES_USER: str = "civicpulse_admin"
    POSTGRES_PASSWORD: str = "civicpulse_secret_key"
    DATABASE_URL: str = "postgresql+asyncpg://civicpulse_admin:civicpulse_secret_key@localhost:5432/civicpulse"

    # Priority Engine Configurable Weights
    PRIORITY_WEIGHT_RISK: float = 0.35
    PRIORITY_WEIGHT_POPULATION: float = 0.25
    PRIORITY_WEIGHT_CRITICAL_FACILITIES: float = 0.20
    PRIORITY_WEIGHT_INFRASTRUCTURE: float = 0.10
    PRIORITY_WEIGHT_HISTORICAL_RECURRENCE: float = 0.10
    PRIORITY_WEIGHTS_LABEL: str = "DEMO / CONFIGURABLE PRIORITY WEIGHTS"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
