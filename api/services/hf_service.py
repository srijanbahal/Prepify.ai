import requests
import logging
import asyncio
from typing import Dict, Optional
from config import HF_API_KEY, HF_MODEL

logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self):
        self.api_key = HF_API_KEY
        self.model = HF_MODEL
        self.base_url = "https://api-inference.huggingface.co/models"
        self.max_retries = 3
        self.base_delay = 1

    async def _retry_with_backoff(self, func, *args, **kwargs):
        """Retry function with exponential backoff"""
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    logger.error(f"Max retries exceeded for HuggingFace API call: {e}")
                    raise
                
                delay = self.base_delay * (2 ** attempt)
                logger.warning(f"HuggingFace API call failed (attempt {attempt + 1}), retrying in {delay}s: {e}")
                await asyncio.sleep(delay)

    async def _make_request(self, payload: Dict) -> Dict:
        """Make request to HuggingFace Inference API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/{self.model}"
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: requests.post(url, headers=headers, json=payload, timeout=30)
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")

    async def analyze_company_culture(self, company_name: str, job_description: str) -> Dict:
        """Analyze company culture using HF model"""
        prompt = f"""
        Analyze the company culture and interview patterns for {company_name} based on this job description:
        
        {job_description}
        
        Focus on:
        - Company values and culture
        - Typical interview process
        - What they look for in candidates
        - Company size and work environment
        """
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        try:
            response = await self._retry_with_backoff(self._make_request, payload)
            
            # Extract text from response
            if isinstance(response, list) and len(response) > 0:
                generated_text = response[0].get("generated_text", "")
            else:
                generated_text = str(response)
            
            return {
                "company_culture_analysis": generated_text,
                "source": "huggingface",
                "model": self.model
            }
            
        except Exception as e:
            logger.error(f"Error analyzing company culture with HF: {e}")
            # Fallback to basic analysis
            return {
                "company_culture_analysis": f"Company culture analysis for {company_name} based on job description.",
                "source": "fallback",
                "error": str(e)
            }

    async def generate_technical_questions(self, tech_stack: list, difficulty: str = "medium") -> list:
        """Generate technical questions based on tech stack"""
        prompt = f"""
        Generate 3-5 technical interview questions for the following technology stack at {difficulty} level:
        
        Technologies: {', '.join(tech_stack)}
        
        Format each question as a separate line starting with "Q: "
        """
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 300,
                "temperature": 0.8,
                "return_full_text": False
            }
        }
        
        try:
            response = await self._retry_with_backoff(self._make_request, payload)
            
            if isinstance(response, list) and len(response) > 0:
                generated_text = response[0].get("generated_text", "")
                # Parse questions from response
                questions = []
                for line in generated_text.split('\n'):
                    if line.strip().startswith('Q:'):
                        questions.append(line.strip()[2:].strip())
                return questions[:5]  # Limit to 5 questions
            
            return []
            
        except Exception as e:
            logger.error(f"Error generating technical questions with HF: {e}")
            return []

    async def analyze_interview_patterns(self, company_name: str, position: str) -> Dict:
        """Analyze common interview patterns for the company and position"""
        prompt = f"""
        What are the common interview patterns and questions for {position} positions at {company_name}?
        
        Include:
        - Interview rounds and structure
        - Common question types
        - Technical assessment format
        - Behavioral questions focus
        """
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 400,
                "temperature": 0.6,
                "return_full_text": False
            }
        }
        
        try:
            response = await self._retry_with_backoff(self._make_request, payload)
            
            if isinstance(response, list) and len(response) > 0:
                generated_text = response[0].get("generated_text", "")
            else:
                generated_text = str(response)
            
            return {
                "interview_patterns": generated_text,
                "company": company_name,
                "position": position,
                "source": "huggingface"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing interview patterns with HF: {e}")
            return {
                "interview_patterns": f"Standard interview patterns for {position} at {company_name}",
                "company": company_name,
                "position": position,
                "source": "fallback",
                "error": str(e)
            }

# Global HuggingFace service instance
hf_service = HuggingFaceService()
