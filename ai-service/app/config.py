import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "GenerateCV-AIService"
    APP_ENV: str = "development"
    PORT: int = 8000
    
    QDRANT_URL: str = "http://qdrant:6333"
    QDRANT_API_KEY: str | None = None
    
    OPENAI_API_KEY: str | None = None
    COHERE_API_KEY: str | None = None
    GITHUB_TOKEN: str | None = None
    DATABASE_URL: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
