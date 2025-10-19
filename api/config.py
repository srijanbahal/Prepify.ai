import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")

# Model Configuration
GEMINI_MODEL = "gemini-2.0-flash-exp"
HF_MODEL = "meta-llama/Llama-3.2-3B-Instruct"

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Rate Limiting
RATE_LIMIT_PER_USER = "5/day"  # 5 analyses per user per day
RATE_LIMIT_GLOBAL = "100/hour"  # Global API protection

# Cache TTL (in seconds)
CACHE_TTL_ANALYSIS = 3600 * 24  # 24 hours
CACHE_TTL_INTERVIEW = 3600 * 2  # 2 hours

# Firebase Configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
