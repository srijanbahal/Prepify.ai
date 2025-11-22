import os
import json
import logging
from typing import Dict, Any, List, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from config import GROQ_API_KEY, GROQ_MODEL
import operator

logger = logging.getLogger(__name__)

# Define the state of the graph
class GraphState(TypedDict):
    user_id: str
    resume_text: str
    job_description: str
    github_url: str
    linkedin_url: str
    
    # Intermediate outputs - using Annotated with a reducer isn't strictly necessary 
    # for sequential flow, but good practice. For now, simple TypedDict is fine 
    # if we ensure sequential writes.
    job_analysis: Dict[str, Any]
    resume_analysis: Dict[str, Any]
    social_analysis: Dict[str, Any]
    
    # Final output
    final_report: Dict[str, Any]

class LangGraphService:
    def __init__(self):
        self.llm = ChatGroq(
            model=GROQ_MODEL,
            api_key=GROQ_API_KEY,
            temperature=0.7
        )
        self.workflow = self._create_workflow()

    def _create_workflow(self):
        # Initialize the graph
        workflow = StateGraph(GraphState)

        # Add nodes
        workflow.add_node("job_analyzer", self._analyze_job)
        workflow.add_node("resume_analyzer", self._analyze_resume)
        workflow.add_node("social_analyzer", self._analyze_social)
        workflow.add_node("synthesizer", self._synthesize_report)

        # Define sequential edges as requested
        # Start -> Job -> Resume -> Social -> Synthesis -> End
        
        workflow.set_entry_point("job_analyzer")
        
        workflow.add_edge("job_analyzer", "resume_analyzer")
        workflow.add_edge("resume_analyzer", "social_analyzer")
        workflow.add_edge("social_analyzer", "synthesizer")
        workflow.add_edge("synthesizer", END)

        return workflow.compile()

    async def run_analysis(self, user_id: str, resume_text: str, job_description: str, github_url: str = "", linkedin_url: str = "") -> Dict[str, Any]:
        """Run the full analysis workflow"""
        
        initial_state = {
            "user_id": user_id,
            "resume_text": resume_text,
            "job_description": job_description,
            "github_url": github_url,
            "linkedin_url": linkedin_url,
            "job_analysis": {},
            "resume_analysis": {},
            "social_analysis": {},
            "final_report": {}
        }
        
        logger.info(f"Starting LangGraph analysis for user {user_id}")
        
        try:
            # Invoke the graph
            result = await self.workflow.ainvoke(initial_state)
            return result["final_report"]
        except Exception as e:
            logger.error(f"Error in LangGraph analysis: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise

    async def generate_interview_questions(self, skill_gaps: List[str], focus_areas: List[str]) -> List[str]:
        """Generate interview questions based on skill gaps and focus areas"""
        logger.info("Generating interview questions...")
        
        prompt = f"""
        Generate 5 technical interview questions based on the following:
        
        Skill Gaps: {', '.join(skill_gaps)}
        Focus Areas: {', '.join(focus_areas)}
        
        The questions should be challenging but fair, designed to test the candidate's knowledge in these areas.
        
        Return ONLY a JSON array of strings, e.g. ["Question 1", "Question 2", ...]
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        try:
            content = response.content.replace("```json", "").replace("```", "").strip()
            questions = json.loads(content)
            return questions
        except Exception as e:
            logger.error(f"Error parsing interview questions: {e}")
            # Fallback questions
            return [
                "Can you describe a challenging project you worked on?",
                "How do you handle technical debt?",
                "Explain a complex technical concept to a non-technical person.",
                "What are your strategies for debugging complex issues?",
                "Where do you see yourself in 5 years?"
            ]

    async def generate_feedback(self, transcript: str) -> Dict[str, Any]:
        """Generate feedback for an interview transcript"""
        try:
            prompt = f"""
            You are an expert interview coach. Analyze the following interview transcript and provide constructive feedback.
            
            Transcript:
            {transcript}
            
            Provide your analysis in the following JSON format:
            {{
                "summary": "Brief summary of the candidate's performance",
                "overall_score": 85,
                "strong_points": ["point 1", "point 2"],
                "areas_to_improve": ["area 1", "area 2"],
                "detailed_analysis": "Detailed feedback..."
            }}
            """
            
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            content = response.content
            
            # Parse JSON
            try:
                # Clean up markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                    
                feedback = json.loads(content.strip())
                return feedback
            except Exception as e:
                logger.error(f"Error parsing feedback JSON: {e}")
                return {
                    "summary": "Feedback generation partially failed",
                    "overall_score": 0,
                    "strong_points": [],
                    "areas_to_improve": [],
                    "detailed_analysis": content
                }
                
        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return {
                "summary": "Error generating feedback",
                "overall_score": 0,
                "strong_points": [],
                "areas_to_improve": [],
                "detailed_analysis": "An error occurred while analyzing the interview."
            }

    # Node Implementations
    
    async def _analyze_job(self, state: GraphState) -> Dict[str, Any]:
        logger.info("Analyzing job description...")
        job_desc = state["job_description"]
        
        prompt = f"""
        Analyze the following job description and extract comprehensive information:
        
        Job Description:
        {job_desc}
        
        Your analysis should include:
        1. Required vs preferred skills identification
        2. Company culture and values analysis (if inferable)
        3. Interview patterns and process insights
        4. Difficulty level assessment
        5. Position title and company information extraction
        6. Technical requirements breakdown
        
        Return ONLY a valid JSON object with these keys:
        - required_skills: List[str]
        - preferred_skills: List[str]
        - company_culture: Dict
        - interview_patterns: List[str]
        - difficulty_level: str
        - company_name: str
        - position_title: str
        - technical_requirements: List[str]
        - summary: str
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        try:
            # Basic JSON parsing cleanup
            content = response.content.replace("```json", "").replace("```", "").strip()
            analysis = json.loads(content)
            return {"job_analysis": analysis}
        except Exception as e:
            logger.error(f"Error parsing job analysis: {e}")
            return {"job_analysis": {"error": str(e), "raw": response.content}}

    async def _analyze_resume(self, state: GraphState) -> Dict[str, Any]:
        logger.info("Analyzing resume with job context...")
        resume_text = state["resume_text"]
        job_analysis = state["job_analysis"]
        
        prompt = f"""
        Analyze the resume in the context of the job analysis provided.
        
        Resume Text:
        {resume_text}
        
        Job Context:
        {json.dumps(job_analysis, indent=2)}
        
        Your analysis should include:
        1. Match assessment against job requirements
        2. Skill gap analysis specific to this job
        3. Work experience relevance
        4. Project impact assessment
        5. Strengths relative to the role
        
        Return ONLY a valid JSON object with these keys:
        - skills: List[str]
        - experience_summary: str
        - match_details: Dict
        - skill_gaps: List[str]
        - strengths: List[str]
        - improvement_areas: List[str]
        - projects_relevance: str
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        try:
            content = response.content.replace("```json", "").replace("```", "").strip()
            analysis = json.loads(content)
            return {"resume_analysis": analysis}
        except Exception as e:
            logger.error(f"Error parsing resume analysis: {e}")
            return {"resume_analysis": {"error": str(e), "raw": response.content}}

    async def _analyze_social(self, state: GraphState) -> Dict[str, Any]:
        logger.info("Analyzing social profiles...")
        github = state["github_url"]
        linkedin = state["linkedin_url"]
        
        if not github and not linkedin:
            return {"social_analysis": {"status": "skipped", "reason": "No URLs provided"}}
            
        prompt = f"""
        Analyze the provided social profile URLs (simulated analysis based on URL patterns and typical content).
        
        GitHub: {github}
        LinkedIn: {linkedin}
        
        Provide a professional assessment of their online presence.
        
        Return ONLY a valid JSON object with these keys:
        - github_presence: str
        - linkedin_presence: str
        - professionalism_score: int (0-100)
        - inferred_skills: List[str]
        - red_flags: List[str]
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        try:
            content = response.content.replace("```json", "").replace("```", "").strip()
            analysis = json.loads(content)
            return {"social_analysis": analysis}
        except Exception as e:
            logger.error(f"Error parsing social analysis: {e}")
            return {"social_analysis": {"error": str(e), "raw": response.content}}

    async def _synthesize_report(self, state: GraphState) -> Dict[str, Any]:
        logger.info("Synthesizing final report...")
        
        # Wait for all inputs (LangGraph handles this by passing accumulated state)
        # But since we have parallel branches, we need to ensure we have everything.
        # The reducer logic in StateGraph defaults to overwriting keys, so we should be fine
        # as long as keys are distinct.
        
        job = state.get("job_analysis", {})
        resume = state.get("resume_analysis", {})
        social = state.get("social_analysis", {})
        
        prompt = f"""
        Synthesize a comprehensive career intelligence report based on the following analyses:
        
        Job Analysis:
        {json.dumps(job, indent=2)}
        
        Resume Analysis:
        {json.dumps(resume, indent=2)}
        
        Social Analysis:
        {json.dumps(social, indent=2)}
        
        Create a detailed report for the candidate.
        
        Return ONLY a valid JSON object with these keys:
        - match_score: int (0-100)
        - summary: str (Executive summary)
        - strengths: List[str]
        - skill_gaps: List[str]
        - recommendations: List[str] (Actionable advice)
        - interview_focus_areas: List[str]
        - company_insights: str
        - social_rating: str
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        try:
            content = response.content.replace("```json", "").replace("```", "").strip()
            report = json.loads(content)
            return {"final_report": report}
        except Exception as e:
            logger.error(f"Error parsing synthesis: {e}")
            return {"final_report": {"error": str(e), "raw": response.content}}

# Singleton instance
langgraph_service = LangGraphService()
