from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from typing import Dict, Any
import logging
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class ResumeAnalysisTool(BaseTool):
    name: str = "resume_analyzer"
    description: str = "Analyzes resume text and extracts structured information about skills, experience, education, and projects"

    def _run(self, resume_text: str) -> str:
        """Run resume analysis"""
        try:
            # This will be called synchronously, but we need async
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(gemini_service.analyze_resume(resume_text))
                return str(result)
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Error in resume analysis tool: {e}")
            return f"Error analyzing resume: {e}"

def create_resume_agent() -> Agent:
    """Create the resume analysis agent"""
    
    resume_tool = ResumeAnalysisTool()
    
    agent = Agent(
        role="Expert Resume Analyzer",
        goal="Extract comprehensive information from resume including skills, experience, education, projects, and achievements",
        backstory="""You are a seasoned HR professional and technical recruiter with 15+ years of experience 
        analyzing resumes across various industries. You have a keen eye for identifying key skills, 
        quantifying achievements, and understanding career progression patterns. You excel at parsing 
        complex technical resumes and extracting actionable insights.""",
        tools=[resume_tool],
        verbose=True,
        allow_delegation=False,
        max_iter=3
    )
    
    return agent

def create_resume_task(resume_text: str) -> Task:
    """Create the resume analysis task"""
    
    task = Task(
        description=f"""
        Analyze the following resume text and extract structured information:
        
        Resume Text:
        {resume_text}
        
        Your analysis should include:
        1. Technical and soft skills identification
        2. Work experience breakdown with key achievements
        3. Educational background and certifications
        4. Notable projects and their impact
        5. Career progression patterns
        6. Strengths and potential areas for improvement
        
        Use the resume_analyzer tool to perform the analysis and return structured data.
        """,
        agent=create_resume_agent(),
        expected_output="""A comprehensive JSON object containing:
        - skills: List of technical and soft skills
        - experience: List of work experiences with details
        - education: List of educational qualifications
        - projects: List of notable projects
        - strengths: List of key strengths
        - weaknesses: List of potential improvement areas"""
    )
    
    return task
