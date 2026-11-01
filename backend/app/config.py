import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    secret_key: str = "dev-only-change-me"
    database_url: str = "sqlite:///./careermap.db"
    frontend_origin: str = "http://localhost:5173"
    ai_api_key: str = ""
    ai_base_url: str = "https://api.openai.com/v1"
    ai_model: str = ""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

settings = Settings()
