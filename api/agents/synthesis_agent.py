from crewai import Agent, Task
from crewai.tools import BaseTool
from typing import Dict, Any
import logging
from services.gemini_service import gemini_service
from config import GROQ_API_KEY, GROQ_MODEL
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

class SynthesisTool(BaseTool):
    name: str = "synthesis_analyzer"
    description: str = "Synthesizes multiple analyses into a comprehensive career intelligence report"

    def _run(self, resume_analysis: str, job_analysis: str, social_analysis: str) -> str:
        """Run synthesis analysis"""
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Parse the  string inputs back to dicts
                import json
                resume_data = json.loads(resume_analysis) if isinstance(resume_analysis, str) else resume_analysis
                job_data = json.loads(job_analysis) if isinstance(job_analysis, str) else job_analysis
                social_data = json.loads(social_analysis) if isinstance(social_analysis, str) else social_analysis
                
                result = loop.run_until_complete(gemini_service.synthesize_analysis(resume_data, job_data, social_data))
                return str(result)
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Error in synthesis analysis tool: {e}")
            return f"Error synthesizing analyses: {e}"

def create_synthesis_agent() -> Agent:
    """Create the synthesis analysis agent"""
    
    synthesis_tool = SynthesisTool()
    
    # Create Groq LLM using ChatGroq
    llm = ChatGroq(
       model=GROQ_MODEL,
        api_key=GROQ_API_KEY,
        temperature=0.7
    )
    
    agent = Agent(
        role="Career Intelligence Synthesizer",
        goal="Combine all agent analyses into a comprehensive career intelligence report with actionable insights",
        backstory="""You are a senior career consultant and data scientist with expertise in synthesizing 
        complex information from multiple sources. You have helped thousands of professionals optimize 
        their career paths by providing data-driven insights and actionable recommendations. You excel 
        at identifying patterns, calculating match scores, and creating personalized development plans.""",
        tools=[synthesis_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=3
    )
    
    return agent

def create_synthesis_task(resume_analysis: str, job_analysis: str, social_analysis: str) -> Task:
    """Create the synthesis analysis task"""
    
    task = Task(
        description=f"""
        Synthesize the following analyses into a comprehensive career intelligence report:
        
        Resume Analysis:
        {resume_analysis}
        
        Job Analysis:
        {job_analysis}
        
        Social Analysis:
        {social_analysis}
        
        Your synthesis should include:
        1. Overall match score calculation (0-1 scale)
        2. Skill gap analysis with specific recommendations
        3. Strength identification and how to leverage them
        4. Personalized recommendations for improvement
        5. Interview focus areas based on gaps and requirements
        6. Executive summary of the analysis
        
        Use the synthesis_analyzer tool to perform the comprehensive analysis.
        """,
        agent=create_synthesis_agent(),
        expected_output="""A comprehensive JSON object containing:
        - match_score: Float between 0-1 representing overall fit
        - skill_gaps: List of specific skill gaps with recommendations
        - strengths: List of key strengths to highlight
        - recommendations: List of actionable recommendations with priorities
        - interview_focus_areas: List of areas to focus on during interviews
        - summary: Executive summary of the analysis"""
    )
    
    return task
