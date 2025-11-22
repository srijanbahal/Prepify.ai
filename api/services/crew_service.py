import asyncio
import logging
from typing import Dict, Any
from datetime import datetime
import uuid
import os
from crewai import Crew, Process

from agents.resume_agent import create_resume_task
from agents.job_agent import create_job_task
from agents.social_agent import create_social_task
from agents.synthesis_agent import create_synthesis_task
from services.redis_service import redis_service
from models import AnalysisResult
from config import GROQ_API_KEY

# Set Groq API key as environment variable for LiteLLM
if GROQ_API_KEY:
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY

logger = logging.getLogger(__name__)

class CrewService:
    def __init__(self):
        self.cache_ttl = 24 * 3600  # 24 hours

    async def run_analysis(self, resume_text: str, job_description: str, social_urls: Dict[str, str], user_id: str) -> Dict[str, Any]:
        """Run the complete analysis using CrewAI multi-agent system"""
        
        # Generate cache key based on input content
        cache_key = f"analysis:{hash(resume_text + job_description + str(social_urls))}"
        
        # Check cache first
        cached_result = await redis_service.get_cached(cache_key)
        if cached_result:
            logger.info(f"Returning cached analysis result for user {user_id}")
            return cached_result
        
        try:
            # Extract URLs
            github_url = social_urls.get("github", "")
            linkedin_url = social_urls.get("linkedin", "")
            
            # Create tasks for parallel execution
            resume_task = create_resume_task(resume_text)
            job_task = create_job_task(job_description)
            social_task = create_social_task(github_url, linkedin_url)
            
            # Run first phase: sequential analysis with 3 agents
            # Note: Changed from parallel to sequential due to CrewAI parallel execution issues
            logger.info(f"Starting sequential analysis for user {user_id}")
            
            crew = Crew(
                agents=[resume_task.agent, job_task.agent, social_task.agent],
                tasks=[resume_task, job_task, social_task],
                process=Process.sequential,
                verbose=True  # Set to 2 for maximum verbosity
            )
            
            # Execute parallel analysis
            parallel_results = await self._execute_crew_async(crew)
            
            # Store intermediate results
            await redis_service.store_agent_results(user_id, parallel_results)
            
            # Extract results for synthesis
            resume_analysis = str(parallel_results.get("resume_analysis", {}))
            job_analysis = str(parallel_results.get("job_analysis", {}))
            social_analysis = str(parallel_results.get("social_analysis", {}))
            
            # Run second phase: synthesis
            logger.info(f"Starting synthesis analysis for user {user_id}")
            
            synthesis_task = create_synthesis_task(resume_analysis, job_analysis, social_analysis)
            synthesis_crew = Crew(
                agents=[synthesis_task.agent],
                tasks=[synthesis_task],
                process=Process.sequential,
                verbose=True
            )
            
            synthesis_result = await self._execute_crew_async(synthesis_crew)
            
            # Combine all results
            final_result = {
                "analysis_id": str(uuid.uuid4()),
                "user_id": user_id,
                "resume_analysis": parallel_results.get("resume_analysis", {}),
                "job_analysis": parallel_results.get("job_analysis", {}),
                "social_analysis": parallel_results.get("social_analysis", {}),
                "synthesis_result": synthesis_result.get("synthesis_result", {}),
                "created_at": datetime.now().isoformat(),
                "expires_at": (datetime.now().timestamp() + self.cache_ttl)
            }
            
            # Cache the final result
            await redis_service.set_cached(cache_key, final_result, self.cache_ttl)
            
            logger.info(f"Analysis completed successfully for user {user_id}")
            return final_result
            
        except Exception as e:
            logger.error(f"Error in analysis for user {user_id}: {e}")
            raise Exception(f"Analysis failed: {str(e)}")

    async def _execute_crew_async(self, crew: Crew) -> Dict[str, Any]:
        """Execute crew in async context"""
        try:
            # Run crew in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, crew.kickoff)
            
            # Parse crew result
            if hasattr(result, 'raw'):
                return result.raw
            elif isinstance(result, dict):
                return result
            else:
                # Try to extract results from crew output
                return self._parse_crew_output(result)
                
        except Exception as e:
            import traceback
            logger.error(f"Error executing crew: {e}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def _parse_crew_output(self, output) -> Dict[str, Any]:
        """Parse crew output into structured format"""
        try:
            # This is a simplified parser - in practice, you might need more sophisticated parsing
            if hasattr(output, '__dict__'):
                return output.__dict__
            elif isinstance(output, str):
                # Try to parse as JSON if it's a string
                import json
                try:
                    return json.loads(output)
                except:
                    return {"raw_output": output}
            else:
                return {"raw_output": str(output)}
        except Exception as e:
            logger.error(f"Error parsing crew output: {e}")
            return {"raw_output": str(output), "parse_error": str(e)}

    async def generate_interview_questions(self, analysis_id: str, user_id: str) -> Dict[str, Any]:
        """Generate interview questions based on analysis"""
        try:
            # Get analysis from cache
            analysis = await redis_service.get_cached(f"analysis:{analysis_id}")
            if not analysis:
                raise Exception("Analysis not found or expired")
            
            synthesis_result = analysis.get("synthesis_result", {})
            skill_gaps = synthesis_result.get("skill_gaps", [])
            interview_focus = synthesis_result.get("interview_focus_areas", [])
            
            # Generate questions using Gemini
            from services.gemini_service import gemini_service
            questions = await gemini_service.generate_interview_questions(skill_gaps, interview_focus)
            
            interview_data = {
                "interview_id": str(uuid.uuid4()),
                "analysis_id": analysis_id,
                "user_id": user_id,
                "questions": questions,
                "created_at": datetime.now().isoformat()
            }
            
            # Store interview context for follow-up questions
            await redis_service.store_interview_context(interview_data["interview_id"], {
                "analysis": analysis,
                "questions": questions
            })
            
            return interview_data
            
        except Exception as e:
            logger.error(f"Error generating interview questions: {e}")
            raise

    async def generate_followup_question(self, interview_id: str, conversation_history: list) -> str:
        """Generate follow-up question during interview"""
        try:
            # Get interview context
            context = await redis_service.get_interview_context(interview_id)
            if not context:
                return "Could you tell me more about your experience with that technology?"
            
            # Generate follow-up using Gemini
            from services.gemini_service import gemini_service
            followup = await gemini_service.generate_followup_question(
                context, 
                conversation_history, 
                max_tokens=150
            )
            
            return followup
            
        except Exception as e:
            logger.error(f"Error generating follow-up question: {e}")
            return "That's interesting. Can you elaborate on that?"

    async def generate_feedback(self, interview_id: str, transcript: str, user_id: str) -> Dict[str, Any]:
        """Generate interview feedback"""
        try:
            # Get interview context
            context = await redis_service.get_interview_context(interview_id)
            if not context:
                raise Exception("Interview context not found")
            
            analysis = context.get("analysis", {})
            synthesis_result = analysis.get("synthesis_result", {})
            skill_gaps = synthesis_result.get("skill_gaps", [])
            questions = context.get("questions", [])
            
            # Generate feedback using Gemini
            from services.gemini_service import gemini_service
            feedback = await gemini_service.generate_feedback(skill_gaps, questions, transcript)
            
            feedback_data = {
                "feedback_id": str(uuid.uuid4()),
                "interview_id": interview_id,
                "user_id": user_id,
                "transcript": transcript,
                "feedback": feedback,
                "created_at": datetime.now().isoformat()
            }
            
            return feedback_data
            
        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            raise

# Global crew service instance
crew_service = CrewService()
