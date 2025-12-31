import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "DSK API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list = ["*"]  # Allow all origins for now
    
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

settings = Settings()
