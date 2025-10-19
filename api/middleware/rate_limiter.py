from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
import logging
from typing import Optional
from config import FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
from services.redis_service import redis_service

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        try:
            # Create credentials from environment variables
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": FIREBASE_PROJECT_ID,
                "private_key": FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                "client_email": FIREBASE_CLIENT_EMAIL,
                "token_uri": "https://oauth2.googleapis.com/token"
            })
            
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")

# Initialize Firebase on import
initialize_firebase()

security = HTTPBearer()

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify Firebase token and return user ID"""
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(credentials.credentials)
        user_id = decoded_token.get('uid')
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")
        
        return user_id
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

class RateLimiter:
    """Rate limiting decorator"""
    
    def __init__(self, limit: str, per_user: bool = True, global_limit: bool = False):
        self.limit = limit
        self.per_user = per_user
        self.global_limit = global_limit
    
    async def __call__(self, request: Request, user_id: Optional[str] = None):
        """Check rate limits"""
        
        # Check per-user rate limit
        if self.per_user and user_id:
            allowed, current_count = await redis_service.check_rate_limit(user_id, "user")
            if not allowed:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. User limit: {self.limit}",
                    headers={"Retry-After": "86400"}  # 24 hours
                )
        
        # Check global rate limit
        if self.global_limit:
            allowed, current_count = await redis_service.check_rate_limit("global", "global")
            if not allowed:
                raise HTTPException(
                    status_code=429,
                    detail=f"Global rate limit exceeded: {self.limit}",
                    headers={"Retry-After": "3600"}  # 1 hour
                )
        
        return True

def rate_limit(limit: str, per_user: bool = True, global_limit: bool = False):
    """Rate limiting decorator factory"""
    limiter = RateLimiter(limit, per_user, global_limit)
    
    async def rate_limit_dependency(request: Request, user_id: str = Depends(verify_firebase_token)):
        await limiter(request, user_id)
        
        # Increment counters after successful check
        if per_user and user_id:
            await redis_service.increment_counter(user_id, "user")
        
        if global_limit:
            await redis_service.increment_counter("global", "global")
        
        return user_id
    
    return rate_limit_dependency
