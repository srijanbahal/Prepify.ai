from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from typing import Dict, Any
import logging
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class SocialProfileTool(BaseTool):
    name: str = "social_profile_analyzer"
    description: str = "Analyzes GitHub and LinkedIn profiles to extract technical insights and contribution patterns"

    def _run(self, github_url: str, linkedin_url: str) -> str:
        """Run social profile analysis"""
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(gemini_service.analyze_social_profile(github_url, linkedin_url))
                return str(result)
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Error in social profile analysis tool: {e}")
            return f"Error analyzing social profiles: {e}"

def create_social_agent() -> Agent:
    """Create the social profile analysis agent"""
    
    social_tool = SocialProfileTool()
    
    agent = Agent(
        role="Social Profile Analyzer",
        goal="Analyze GitHub repositories, LinkedIn profile, and contribution patterns to assess technical skills and project quality",
        backstory="""You are a technical recruiter and open-source community expert with deep knowledge 
        of GitHub ecosystems and professional networking platforms. You have analyzed thousands of 
        developer profiles and understand how to assess code quality, contribution patterns, and 
        technical expertise from social profiles. You excel at identifying top performers and 
        understanding project impact.""",
        tools=[social_tool],
        verbose=True,
        allow_delegation=False,
        max_iter=3
    )
    
    return agent

def create_social_task(github_url: str, linkedin_url: str) -> Task:
    """Create the social profile analysis task"""
    
    task = Task(
        description=f"""
        Analyze the following social profiles to extract technical insights:
        
        GitHub URL: {github_url}
        LinkedIn URL: {linkedin_url}
        
        Your analysis should include:
        1. GitHub repository statistics and quality assessment
        2. Top projects and their technical complexity
        3. Technology stack identification
        4. Contribution quality and consistency
        5. Profile completeness and professionalism
        6. Open source contributions and community involvement
        
        Use the social_profile_analyzer tool to perform the analysis.
        """,
        agent=create_social_agent(),
        expected_output="""A comprehensive JSON object containing:
        - github_stats: Object with repository count, contributions, stars, followers
        - top_projects: List of notable projects with details
        - tech_stack: List of technologies used
        - contribution_quality: Assessment of contribution quality
        - profile_completeness: Assessment of profile completeness"""
    )
    
    return task
