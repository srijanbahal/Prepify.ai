from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import traceback
import json
from typing import Dict, Any, Optional
from datetime import datetime

from models import (
    AnalysisRequest, AnalysisResponse,
    InterviewRequest, InterviewResponse,
    FollowupRequest, FollowupResponse,
    FeedbackRequest, FeedbackResponse
)
from middleware.rate_limiter import rate_limit, verify_firebase_token
from services.langgraph_service import langgraph_service
# from services.crew_service import crew_service
from config import DEBUG
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO if not DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Prepify.ai API",
    description="AI-powered career analysis and interview preparation platform",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://prepify.ai"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc) if DEBUG else "Something went wrong"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "prepify-api"}

from services.supabase_service import supabase_service

# Auth sync endpoint
class UserSyncRequest(BaseModel):
    name: Optional[str] = None

@app.post("/auth/sync")
async def sync_user(
    request: UserSyncRequest = None,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Sync Firebase user to Supabase database
    This should be called immediately after signup/signin
    """
    try:
        from firebase_admin import auth as firebase_auth
        
        # Get user details from Firebase
        try:
            firebase_user = firebase_auth.get_user(user_id)
            email = firebase_user.email
            # Prefer name from request body, then Firebase display_name, then email prefix
            if request and request.name:
                name = request.name
            elif firebase_user.display_name:
                name = firebase_user.display_name
            else:
                name = email.split('@')[0] if email else "User"
            picture = firebase_user.photo_url
        except Exception as e:
            logger.error(f"Error fetching Firebase user details: {e}")
            # Use minimal info if Firebase fetch fails
            email = None
            name = request.name if request and request.name else "User"
            picture = None
        
        # Check if user exists in Supabase
        existing_user = await supabase_service.get_user(user_id)
        
        if existing_user:
            logger.info(f"User already exists in Supabase: {user_id}")
            return {
                "success": True,
                "message": "User already synced",
                "user_id": existing_user['id'],
                "is_new": False
            }
        
        # Create new user in Supabase
        logger.info(f"Creating new user in Supabase: {user_id}")
        new_user = await supabase_service.create_user({
            "firebase_uid": user_id,
            "email": email,
            "full_name": name,
            "avatar_url": picture
        })
        
        if not new_user:
            raise HTTPException(status_code=500, detail="Failed to create user in database")
        
        logger.info(f"User successfully synced to Supabase: {user_id}")
        return {
            "success": True,
            "message": "User synced successfully",
            "user_id": new_user['id'],
            "is_new": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing user: {e}")
        raise HTTPException(status_code=500, detail=f"User sync failed: {str(e)}")

# Analysis endpoint
@app.post("/analyze", response_model=AnalysisResponse, dependencies=[
    Depends(rate_limit("5/day", per_user=True)),
    Depends(rate_limit("100/hour", global_limit=True))
])
async def analyze(
    request: AnalysisRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Analyze resume, job description, and social profiles to generate career insights
    """
    try:
        logger.info(f"Starting analysis for user {user_id}")
        
        # Validate input
        if not request.resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume text is required")
        
        if not request.job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")
            
        # Resolve Supabase User ID
        supabase_user = await supabase_service.get_user(user_id)
        if not supabase_user:
            # Should have been created by middleware, but just in case
            raise HTTPException(status_code=404, detail="User not found in database")
        
        db_user_id = supabase_user['id']
        
        # Run analysis using LangGraph
        final_report = await langgraph_service.run_analysis(
            user_id=user_id,
            resume_text=request.resume_text,
            job_description=request.job_description,
            github_url=request.social_profiles.get("github", "") if request.social_profiles else "",
            linkedin_url=request.social_profiles.get("linkedin", "") if request.social_profiles else ""
        )
        
        # Save to Supabase
        analysis_data = {
            "user_id": db_user_id,
            "job_description": request.job_description,
            "resume_text": request.resume_text,
            "github_url": request.social_profiles.get("github", "") if request.social_profiles else "",
            "linkedin_url": request.social_profiles.get("linkedin", "") if request.social_profiles else "",
            "status": "completed",
            "match_score": final_report.get("match_score", 0),
            "synthesis_result": final_report
        }
        
        saved_analysis = await supabase_service.create_analysis(analysis_data)
        if not saved_analysis:
             raise HTTPException(status_code=500, detail="Failed to save analysis to database")
        
        analysis_id = saved_analysis['id']
        
        response = AnalysisResponse(
            analysis_id=analysis_id,
            match_score=final_report.get("match_score", 0.0),
            skill_gaps=final_report.get("skill_gaps", []),
            strengths=final_report.get("strengths", []),
            recommendations=final_report.get("recommendations", []),
            interview_focus_areas=final_report.get("interview_focus_areas", []),
            summary=final_report.get("summary", "Analysis completed successfully")
        )
        
        logger.info(f"Analysis completed for user {user_id}, analysis_id: {response.analysis_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analysis endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/interview/generate", response_model=InterviewResponse)
async def generate_interview(
    request: InterviewRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Generate interview questions based on analysis
    """
    try:
        logger.info(f"Generating interview for user {user_id}, analysis_id: {request.analysis_id}")
        
        # Resolve Supabase User ID
        supabase_user = await supabase_service.get_user(user_id)
        if not supabase_user:
            raise HTTPException(status_code=404, detail="User not found")
        db_user_id = supabase_user['id']
        
        # Get analysis from Supabase
        analysis = await supabase_service.get_analysis(request.analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        # Verify ownership
        if analysis.get("user_id") != db_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        synthesis_result = analysis.get("synthesis_result", {})
        skill_gaps = synthesis_result.get("skill_gaps", [])
        focus_areas = synthesis_result.get("interview_focus_areas", [])
        
        # Generate questions using LangGraph Service
        questions = await langgraph_service.generate_interview_questions(skill_gaps, focus_areas)
        
        # Save interview to Supabase
        interview_data = {
            "user_id": db_user_id,
            "analysis_id": request.analysis_id,
            "status": "created",
            "overall_score": 0
        }
        saved_interview = await supabase_service.create_interview(interview_data)
        if not saved_interview:
             raise HTTPException(status_code=500, detail="Failed to create interview")
        
        interview_id = saved_interview['id']
        
        # Save questions
        questions_data = []
        for i, q in enumerate(questions):
            questions_data.append({
                "interview_id": interview_id,
                "content": q,
                "order_index": i
            })
            
        await supabase_service.add_questions(questions_data)
        
        response = InterviewResponse(
            interview_id=interview_id,
            initial_questions=questions
        )
        
        logger.info(f"Interview generated for user {user_id}, interview_id: {response.interview_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating interview: {e}")
        raise HTTPException(status_code=500, detail=f"Interview generation failed: {str(e)}")

@app.get("/interview/{interview_id}")
async def get_interview_data(
    interview_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Retrieve interview data and questions
    """
    try:
        # Resolve Supabase User ID
        supabase_user = await supabase_service.get_user(user_id)
        if not supabase_user:
            raise HTTPException(status_code=404, detail="User not found")
        db_user_id = supabase_user['id']
        
        # Get interview
        interview = await supabase_service.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
            
        # Verify ownership
        if interview.get("user_id") != db_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        # Get questions
        questions = await supabase_service.get_interview_questions(interview_id)
        
        return {
            "interview": interview,
            "questions": questions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving interview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interview: {str(e)}")

@app.post("/feedback/analyze", response_model=FeedbackResponse)
async def analyze_feedback(
    request: FeedbackRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Analyze interview transcript and generate feedback
    """
    try:
        logger.info(f"Analyzing feedback for user {user_id}, interview_id: {request.interview_id}")
        
        # Resolve Supabase User ID
        supabase_user = await supabase_service.get_user(user_id)
        if not supabase_user:
            raise HTTPException(status_code=404, detail="User not found")
        db_user_id = supabase_user['id']
        
        # Verify ownership
        interview = await supabase_service.get_interview(request.interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        if interview.get("user_id") != db_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        # Generate feedback
        feedback = await langgraph_service.generate_feedback(request.transcript)
        
        # Update interview in Supabase
        updates = {
            "status": "completed",
            "overall_score": feedback.get("overall_score", 0),
            "feedback_summary": json.dumps(feedback)
        }
        await supabase_service.update_interview(request.interview_id, updates)
        
        # Return response
        response = FeedbackResponse(
            feedback_id=request.interview_id,
            summary=feedback.get("summary", ""),
            overall_score=feedback.get("overall_score", 0),
            strong_points=feedback.get("strong_points", []),
            areas_to_improve=feedback.get("areas_to_improve", []),
            detailed_analysis=feedback.get("detailed_analysis", "")
        )
        
        logger.info(f"Feedback analysis completed for user {user_id}, interview_id: {response.feedback_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback analysis failed: {str(e)}")

@app.get("/feedback/{interview_id}", response_model=FeedbackResponse)
async def get_feedback(
    interview_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Retrieve feedback for an interview
    """
    try:
        # Resolve Supabase User ID
        supabase_user = await supabase_service.get_user(user_id)
        if not supabase_user:
            raise HTTPException(status_code=404, detail="User not found")
        db_user_id = supabase_user['id']
        
        # Get interview
        interview = await supabase_service.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
            
        # Verify ownership
        if interview.get("user_id") != db_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        feedback_json = interview.get("feedback_summary")
        if not feedback_json:
            raise HTTPException(status_code=404, detail="Feedback not found")
            
        try:
            feedback = json.loads(feedback_json)
        except:
            # Fallback if it's just text
            feedback = {"detailed_analysis": feedback_json}
            
        return FeedbackResponse(
            feedback_id=interview_id,
            summary=feedback.get("summary", ""),
            overall_score=feedback.get("overall_score", 0),
            strong_points=feedback.get("strong_points", []),
            areas_to_improve=feedback.get("areas_to_improve", []),
            detailed_analysis=feedback.get("detailed_analysis", "")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve feedback: {str(e)}")

# Follow-up question endpoint (for real-time interview)
# ... (keep commented out for now)

# Feedback analysis endpoint
# ... (keep commented out for now)

# Get analysis endpoint (for retrieving cached results)
@app.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Retrieve analysis results by ID
    """
    try:
        logger.info(f"Retrieving analysis {analysis_id} for user {user_id}")
        
        # Resolve Supabase User ID
        supabase_user = await supabase_service.get_user(user_id)
        if not supabase_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db_user_id = supabase_user['id']
        
        # Get from Supabase
        analysis = await supabase_service.get_analysis(analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Verify user owns this analysis
        if analysis.get("user_id") != db_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT
    
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=DEBUG,
        log_level="info" if not DEBUG else "debug"
    )
