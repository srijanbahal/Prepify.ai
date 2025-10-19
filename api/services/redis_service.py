import redis
import json
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from config import REDIS_URL, CACHE_TTL_ANALYSIS, CACHE_TTL_INTERVIEW

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        try:
            self.redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None

    def _generate_cache_key(self, prefix: str, data: str) -> str:
        """Generate a consistent cache key from data"""
        hash_obj = hashlib.md5(data.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"

    async def get_cached(self, key: str) -> Optional[Dict]:
        """Get cached data"""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Error getting cached data: {e}")
        return None

    async def set_cached(self, key: str, data: Dict, ttl: int = CACHE_TTL_ANALYSIS) -> bool:
        """Set cached data with TTL"""
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.setex(key, ttl, json.dumps(data, default=str))
            return True
        except Exception as e:
            logger.error(f"Error setting cached data: {e}")
            return False

    async def invalidate(self, pattern: str) -> int:
        """Invalidate cache entries matching pattern"""
        if not self.redis_client:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")
        return 0

    async def check_rate_limit(self, user_id: str, limit_type: str = "user") -> tuple[bool, int]:
        """Check if user has exceeded rate limit"""
        if not self.redis_client:
            return True, 0  # Allow if Redis is down
        
        try:
            key = f"rate_limit:{limit_type}:{user_id}"
            current_count = self.redis_client.get(key)
            
            if current_count is None:
                return True, 0
            
            current_count = int(current_count)
            
            # Define limits based on type
            limits = {
                "user": 5,  # 5 per day per user
                "global": 100  # 100 per hour globally
            }
            
            limit = limits.get(limit_type, 5)
            return current_count < limit, current_count
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            return True, 0

    async def increment_counter(self, user_id: str, limit_type: str = "user") -> int:
        """Increment rate limit counter"""
        if not self.redis_client:
            return 0
        
        try:
            key = f"rate_limit:{limit_type}:{user_id}"
            
            # Set TTL based on limit type
            ttl = 86400 if limit_type == "user" else 3600  # 24h for user, 1h for global
            
            current_count = self.redis_client.incr(key)
            if current_count == 1:  # First increment, set TTL
                self.redis_client.expire(key, ttl)
            
            return current_count
            
        except Exception as e:
            logger.error(f"Error incrementing counter: {e}")
            return 0

    async def store_agent_results(self, user_id: str, results: Dict) -> bool:
        """Store intermediate agent results"""
        key = f"agent_results:{user_id}:{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        return await self.set_cached(key, results, CACHE_TTL_INTERVIEW)

    async def get_agent_results(self, user_id: str, timestamp: str) -> Optional[Dict]:
        """Get stored agent results"""
        key = f"agent_results:{user_id}:{timestamp}"
        return await self.get_cached(key)

    async def store_interview_context(self, interview_id: str, context: Dict) -> bool:
        """Store interview context for follow-up questions"""
        key = f"interview_context:{interview_id}"
        return await self.set_cached(key, context, CACHE_TTL_INTERVIEW)

    async def get_interview_context(self, interview_id: str) -> Optional[Dict]:
        """Get interview context for follow-up questions"""
        key = f"interview_context:{interview_id}"
        return await self.get_cached(key)

# Global Redis service instance
redis_service = RedisService()
