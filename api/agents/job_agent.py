from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from typing import Dict, Any
import logging
from services.gemini_service import gemini_service
from services.hf_service import hf_service

logger = logging.getLogger(__name__)

class JobAnalysisTool(BaseTool):
    name: str = "job_analyzer"
    description: str = "Analyzes job description and extracts requirements, company culture, and interview patterns"

    def _run(self, job_description: str) -> str:
        """Run job analysis"""
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(gemini_service.analyze_job_description(job_description))
                return str(result)
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Error in job analysis tool: {e}")
            return f"Error analyzing job description: {e}"

class CompanyCultureTool(BaseTool):
    name: str = "company_culture_analyzer"
    description: str = "Analyzes company culture and interview patterns using specialized models"

    def _run(self, company_name: str, job_description: str) -> str:
        """Run company culture analysis"""
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(hf_service.analyze_company_culture(company_name, job_description))
                return str(result)
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Error in company culture analysis tool: {e}")
            return f"Error analyzing company culture: {e}"

def create_job_agent() -> Agent:
    """Create the job analysis agent"""
    
    job_tool = JobAnalysisTool()
    culture_tool = CompanyCultureTool()
    
    agent = Agent(
        role="Job Description & Company Culture Analyst",
        goal="Extract comprehensive requirements, company culture insights, and interview patterns from job descriptions",
        backstory="""You are a senior talent acquisition specialist with expertise in analyzing job descriptions 
        and understanding company cultures. You have worked with hundreds of companies across different industries 
        and have deep knowledge of what different companies look for in candidates. You excel at identifying 
        hidden requirements, understanding company values, and predicting interview patterns.""",
        tools=[job_tool, culture_tool],
        verbose=True,
        allow_delegation=False,
        max_iter=3
    )
    
    return agent

def create_job_task(job_description: str, company_name: str = "Unknown Company") -> Task:
    """Create the job analysis task"""
    
    task = Task(
        description=f"""
        Analyze the following job description and extract comprehensive information:
        
        Job Description:
        {job_description}
        
        Company: {company_name}
        
        Your analysis should include:
        1. Required vs preferred skills identification
        2. Company culture and values analysis
        3. Interview patterns and process insights
        4. Difficulty level assessment
        5. Position title and company information extraction
        6. Technical requirements breakdown
        
        Use both the job_analyzer and company_culture_analyzer tools to get comprehensive insights.
        """,
        agent=create_job_agent(),
        expected_output="""A comprehensive JSON object containing:
        - required_skills: List of mandatory skills
        - preferred_skills: List of nice-to-have skills
        - company_culture: Object with values, work style, team size
        - interview_patterns: List of common interview patterns
        - difficulty_level: Entry/mid/senior level assessment
        - company_name: Extracted company name
        - position_title: Extracted position title"""
    )
    
    return task
