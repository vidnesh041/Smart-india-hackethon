import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "AI-Driven Rural Business Advisory & Financial Structuring Assistant"
    API_V1_PREFIX: str = "/api"
    
    # Database: Uses SQLite by default for instant local setup, or PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/rural_advisory.db")
    
    # Gemini API Key & Model
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Optional OpenAI fallback
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Frontend origin for CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
