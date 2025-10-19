import google.generativeai as genai
import logging
import asyncio
import time
from typing import Dict, List, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required")
        
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)
        self.max_retries = 3
        self.base_delay = 1

    async def _retry_with_backoff(self, func, *args, **kwargs):
        """Retry function with exponential backoff"""
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    logger.error(f"Max retries exceeded for Gemini API call: {e}")
                    raise
                
                delay = self.base_delay * (2 ** attempt)
                logger.warning(f"Gemini API call failed (attempt {attempt + 1}), retrying in {delay}s: {e}")
                await asyncio.sleep(delay)

    async def generate_content(self, prompt: str, max_tokens: int = 1000) -> str:
        """Generate content using Gemini API"""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(prompt)
            )
            
            if response.text:
                return response.text.strip()
            else:
                logger.warning("Empty response from Gemini API")
                return ""
                
        except Exception as e:
            logger.error(f"Error generating content with Gemini: {e}")
            raise

    async def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume and extract structured data"""
        prompt = f"""
        Analyze the following resume and extract structured information in JSON format.
        Focus on skills, experience, education, projects, and achievements.
        
        Resume:
        {resume_text}
        
        Return a JSON object with the following structure:
        {{
            "skills": ["skill1", "skill2", ...],
            "experience": [
                {{
                    "title": "Job Title",
                    "company": "Company Name",
                    "duration": "Duration",
                    "description": "Brief description"
                }}
            ],
            "education": [
                {{
                    "degree": "Degree Name",
                    "institution": "Institution Name",
                    "year": "Year"
                }}
            ],
            "projects": [
                {{
                    "name": "Project Name",
                    "description": "Project description",
                    "technologies": ["tech1", "tech2"]
                }}
            ],
            "strengths": ["strength1", "strength2", ...],
            "weaknesses": ["weakness1", "weakness2", ...]
        }}
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt)
        return self._parse_json_response(response)

    async def analyze_job_description(self, job_description: str) -> Dict:
        """Analyze job description and extract requirements"""
        prompt = f"""
        Analyze the following job description and extract structured information in JSON format.
        
        Job Description:
        {job_description}
        
        Return a JSON object with the following structure:
        {{
            "required_skills": ["skill1", "skill2", ...],
            "preferred_skills": ["skill1", "skill2", ...],
            "company_culture": {{
                "values": ["value1", "value2"],
                "work_style": "description",
                "team_size": "description"
            }},
            "interview_patterns": ["pattern1", "pattern2", ...],
            "difficulty_level": "entry/mid/senior",
            "company_name": "Company Name",
            "position_title": "Position Title"
        }}
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt)
        return self._parse_json_response(response)

    async def analyze_social_profile(self, github_url: str, linkedin_url: str) -> Dict:
        """Analyze social profiles (GitHub/LinkedIn)"""
        prompt = f"""
        Based on the provided GitHub and LinkedIn URLs, analyze the social profile and return structured information.
        
        GitHub URL: {github_url}
        LinkedIn URL: {linkedin_url}
        
        Note: This is a placeholder analysis. In a real implementation, you would scrape these URLs.
        
        Return a JSON object with the following structure:
        {{
            "github_stats": {{
                "repositories": 0,
                "contributions": 0,
                "stars": 0,
                "followers": 0
            }},
            "top_projects": [
                {{
                    "name": "Project Name",
                    "description": "Description",
                    "stars": 0,
                    "language": "Primary Language"
                }}
            ],
            "tech_stack": ["tech1", "tech2", ...],
            "contribution_quality": "high/medium/low",
            "profile_completeness": "high/medium/low"
        }}
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt)
        return self._parse_json_response(response)

    async def synthesize_analysis(self, resume_analysis: Dict, job_analysis: Dict, social_analysis: Dict) -> Dict:
        """Synthesize all analyses into a comprehensive report"""
        prompt = f"""
        Synthesize the following analyses into a comprehensive career intelligence report.
        
        Resume Analysis:
        {resume_analysis}
        
        Job Analysis:
        {job_analysis}
        
        Social Analysis:
        {social_analysis}
        
        Return a JSON object with the following structure:
        {{
            "match_score": 0.85,
            "skill_gaps": ["gap1", "gap2", ...],
            "strengths": ["strength1", "strength2", ...],
            "recommendations": [
                {{
                    "category": "skill_development",
                    "title": "Recommendation Title",
                    "description": "Detailed recommendation",
                    "priority": "high/medium/low"
                }}
            ],
            "interview_focus_areas": ["area1", "area2", ...],
            "summary": "Overall summary of the analysis"
        }}
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt)
        return self._parse_json_response(response)

    async def generate_interview_questions(self, skill_gaps: List[str], interview_focus: List[str]) -> List[str]:
        """Generate initial interview questions"""
        prompt = f"""
        Generate 5-7 interview questions based on the skill gaps and focus areas.
        
        Skill Gaps: {skill_gaps}
        Interview Focus Areas: {interview_focus}
        
        Return a JSON array of questions:
        ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt)
        questions = self._parse_json_response(response)
        return questions if isinstance(questions, list) else []

    async def generate_followup_question(self, context: Dict, conversation_history: List[Dict], max_tokens: int = 150) -> str:
        """Generate follow-up question during interview"""
        prompt = f"""
        Based on the interview context and conversation history, generate a relevant follow-up question.
        Keep it concise and natural for a voice interview.
        
        Context: {context}
        Conversation History: {conversation_history}
        
        Return only the question text, no JSON formatting.
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt, max_tokens)
        return response.strip()

    async def generate_feedback(self, skill_gaps: List[str], questions: List[str], transcript: str) -> Dict:
        """Generate interview feedback"""
        prompt = f"""
        Analyze the interview transcript and provide detailed feedback.
        
        Original Skill Gaps: {skill_gaps}
        Interview Questions: {questions}
        Transcript: {transcript}
        
        Return a JSON object with the following structure:
        {{
            "overall_score": 0.75,
            "strong_points": ["point1", "point2", ...],
            "areas_to_improve": ["area1", "area2", ...],
            "detailed_analysis": "Detailed analysis of the interview performance",
            "summary": "Brief summary of the feedback"
        }}
        """
        
        response = await self._retry_with_backoff(self.generate_content, prompt)
        return self._parse_json_response(response)

    def _parse_json_response(self, response: str) -> Dict:
        """Parse JSON response from Gemini"""
        try:
            import json
            # Try to find JSON in the response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
            else:
                logger.warning(f"Could not find JSON in response: {response}")
                return {}
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response was: {response}")
            return {}

# Global Gemini service instance
gemini_service = GeminiService()
