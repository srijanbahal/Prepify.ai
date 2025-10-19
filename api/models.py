from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

# Request Models
class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    social_profiles: Dict[str, str]  # {github, linkedin}

class InterviewRequest(BaseModel):
    analysis_id: str

class FollowupRequest(BaseModel):
    interview_id: str
    conversation_history: List[Dict]

class FeedbackRequest(BaseModel):
    interview_id: str
    transcript: str

# Response Models
class AnalysisResponse(BaseModel):
    analysis_id: str
    match_score: float
    skill_gaps: List[str]
    strengths: List[str]
    recommendations: List[str]
    interview_focus_areas: List[str]
    summary: str

class InterviewResponse(BaseModel):
    interview_id: str
    initial_questions: List[str]

class FollowupResponse(BaseModel):
    followup_question: str

class FeedbackResponse(BaseModel):
    feedback_id: str
    summary: str
    overall_score: float
    strong_points: List[str]
    areas_to_improve: List[str]
    detailed_analysis: str

# Internal Models
class AgentResult(BaseModel):
    agent_name: str
    result: Dict
    timestamp: datetime

class AnalysisResult(BaseModel):
    analysis_id: str
    user_id: str
    resume_analysis: Dict
    job_analysis: Dict
    social_analysis: Dict
    synthesis_result: Dict
    created_at: datetime
    expires_at: datetime
