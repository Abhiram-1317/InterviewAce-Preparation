import os
from pathlib import Path
from dotenv import load_dotenv

# Locate and load the .env file from the backend root
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    """Application configuration settings loaded from environment variables."""

    PROJECT_NAME: str = "InterviewAce API"
    VERSION: str = "1.0"

    _raw_mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    if _raw_mongo_uri:
        _raw_mongo_uri = _raw_mongo_uri.strip().strip("\"'").strip()
        if _raw_mongo_uri and not (_raw_mongo_uri.startswith("mongodb://") or _raw_mongo_uri.startswith("mongodb+srv://")):
            if "mongodb.net" in _raw_mongo_uri:
                _raw_mongo_uri = f"mongodb+srv://{_raw_mongo_uri}"
            else:
                _raw_mongo_uri = f"mongodb://{_raw_mongo_uri}"
    MONGODB_URI: str = _raw_mongo_uri or "mongodb://localhost:27017"
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "interviewace")
    # AI Providers Configuration
    DEFAULT_AI_PROVIDER: str = os.getenv("DEFAULT_AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    CUSTOM_AI_BASE_URL: str = os.getenv("CUSTOM_AI_BASE_URL", "")
    CUSTOM_AI_API_KEY: str = os.getenv("CUSTOM_AI_API_KEY", "")
    CUSTOM_AI_MODEL: str = os.getenv("CUSTOM_AI_MODEL", "default")

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "9a2b8e34cf78d1230e5f492b0c1e873194a5bd278940ef901234abcd5678ef90"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")


settings = Settings()

