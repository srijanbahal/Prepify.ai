import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from supabase import create_client, Client
import logging
import uuid

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.url: str = os.environ.get("SUPABASE_URL")
        self.key: str = os.environ.get("SUPABASE_KEY")
        self.client: Optional[Client] = None
        
        if self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                logger.info("Supabase client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
        else:
            logger.warning("Supabase credentials not found. Database features will be disabled.")

    async def get_user(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        if not self.client: return None
        try:
            response = self.client.table("users").select("*").eq("firebase_uid", firebase_uid).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching user: {e}")
            return None

    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.client: return None
        try:
            response = self.client.table("users").insert(user_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None

    async def create_analysis(self, analysis_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.client: return None
        try:
            response = self.client.table("analyses").insert(analysis_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating analysis: {e}")
            return None

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        if not self.client: return None
        try:
            response = self.client.table("analyses").select("*").eq("id", analysis_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching analysis: {e}")
            return None

    async def create_interview(self, interview_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.client: return None
        try:
            response = self.client.table("interviews").insert(interview_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating interview: {e}")
            return None

    async def get_interview(self, interview_id: str) -> Optional[Dict[str, Any]]:
        if not self.client: return None
        try:
            response = self.client.table("interviews").select("*").eq("id", interview_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching interview: {e}")
            return None

    async def update_interview(self, interview_id: str, updates: Dict[str, Any]) -> bool:
        if not self.client: return False
        try:
            self.client.table("interviews").update(updates).eq("id", interview_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error updating interview: {e}")
            return False
            
    async def add_questions(self, questions: List[Dict[str, Any]]) -> bool:
        if not self.client: return False
        try:
            self.client.table("questions").insert(questions).execute()
            return True
        except Exception as e:
            logger.error(f"Error adding questions: {e}")
            return False
            
    async def get_interview_questions(self, interview_id: str) -> List[Dict[str, Any]]:
        if not self.client: return []
        try:
            response = self.client.table("questions").select("*").eq("interview_id", interview_id).order("order_index").execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching questions: {e}")
            return []

    async def get_user_analyses(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.client: return []
        try:
            response = self.client.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching user analyses: {e}")
            return []

    async def get_user_interviews(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.client: return []
        try:
            response = self.client.table("interviews").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching user interviews: {e}")
            return []

    async def get_analysis_interviews(self, analysis_id: str) -> List[Dict[str, Any]]:
        if not self.client: return []
        try:
            response = self.client.table("interviews").select("*").eq("analysis_id", analysis_id).order("created_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching analysis interviews: {e}")
            return []

supabase_service = SupabaseService()
