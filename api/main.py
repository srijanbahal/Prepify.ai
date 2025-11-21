from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import traceback
from typing import Dict, Any

from models import (
    AnalysisRequest, AnalysisResponse,
    InterviewRequest, InterviewResponse,
    FollowupRequest, FollowupResponse,
    FeedbackRequest, FeedbackResponse
)
from middleware.rate_limiter import rate_limit, verify_firebase_token
from services.crew_service import crew_service
from config import DEBUG

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
        
        # Run analysis using CrewAI
        result = await crew_service.run_analysis(
            resume_text=request.resume_text,
            job_description=request.job_description,
            social_urls=request.social_profiles,
            user_id=user_id
        )
        
        # Extract synthesis result for response
        synthesis_result = result.get("synthesis_result", {})
        
        response = AnalysisResponse(
            analysis_id=result["analysis_id"],
            match_score=synthesis_result.get("match_score", 0.0),
            skill_gaps=synthesis_result.get("skill_gaps", []),
            strengths=synthesis_result.get("strengths", []),
            recommendations=synthesis_result.get("recommendations", []),
            interview_focus_areas=synthesis_result.get("interview_focus_areas", []),
            summary=synthesis_result.get("summary", "Analysis completed successfully")
        )
        
        logger.info(f"Analysis completed for user {user_id}, analysis_id: {response.analysis_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analysis endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Interview generation endpoint
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
        
        # Generate interview questions
        interview_data = await crew_service.generate_interview_questions(
            analysis_id=request.analysis_id,
            user_id=user_id
        )
        
        response = InterviewResponse(
            interview_id=interview_data["interview_id"],
            initial_questions=interview_data["questions"]
        )
        
        logger.info(f"Interview generated for user {user_id}, interview_id: {response.interview_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating interview: {e}")
        raise HTTPException(status_code=500, detail=f"Interview generation failed: {str(e)}")

# Follow-up question endpoint (for real-time interview)
@app.post("/interview/followup", response_model=FollowupResponse)
async def generate_followup(
    request: FollowupRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Generate follow-up questions during interview
    """
    try:
        logger.info(f"Generating follow-up for user {user_id}, interview_id: {request.interview_id}")
        
        # Generate follow-up question
        followup_question = await crew_service.generate_followup_question(
            interview_id=request.interview_id,
            conversation_history=request.conversation_history
        )
        
        response = FollowupResponse(followup_question=followup_question)
        
        logger.info(f"Follow-up generated for user {user_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating follow-up: {e}")
        raise HTTPException(status_code=500, detail=f"Follow-up generation failed: {str(e)}")

# Feedback analysis endpoint
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
        
        # Generate feedback
        feedback_data = await crew_service.generate_feedback(
            interview_id=request.interview_id,
            transcript=request.transcript,
            user_id=user_id
        )
        
        feedback = feedback_data["feedback"]
        
        response = FeedbackResponse(
            feedback_id=feedback_data["feedback_id"],
            summary=feedback.get("summary", "Feedback analysis completed"),
            overall_score=feedback.get("overall_score", 0.0),
            strong_points=feedback.get("strong_points", []),
            areas_to_improve=feedback.get("areas_to_improve", []),
            detailed_analysis=feedback.get("detailed_analysis", "Detailed analysis not available")
        )
        
        logger.info(f"Feedback analysis completed for user {user_id}, feedback_id: {response.feedback_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback analysis failed: {str(e)}")

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
        
        # Try to get from cache
        from services.redis_service import redis_service
        analysis = await redis_service.get_cached(f"analysis:{analysis_id}")
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found or expired")
        
        # Verify user owns this analysis
        if analysis.get("user_id") != user_id:
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
