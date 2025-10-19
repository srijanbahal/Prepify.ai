import json
import re
from typing import Dict, Any, List

def parse_agent_output(output: str) -> Dict[str, Any]:
    """Parse agent output string to dictionary"""
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        # If not JSON, return as text
        return {"raw_output": output}

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Extract JSON object from text that might contain other content"""
    # Try to find JSON object in text
    json_pattern = r'\{.*\}'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue
    
    # If no JSON found, return text as is
    return {"raw_text": text}

def validate_analysis_result(result: Dict[str, Any]) -> bool:
    """Validate that analysis result has required fields"""
    required_fields = ["match_score", "skill_gaps", "strengths", "recommendations"]
    
    for field in required_fields:
        if field not in result:
            return False
    
    # Validate types
    if not isinstance(result["match_score"], (int, float)):
        return False
    
    if not isinstance(result["skill_gaps"], list):
        return False
    
    if not isinstance(result["strengths"], list):
        return False
    
    if not isinstance(result["recommendations"], list):
        return False
    
    return True

def sanitize_input(text: str, max_length: int = 10000) -> str:
    """Sanitize input text for processing"""
    if not text:
        return ""
    
    # Truncate if too long
    if len(text) > max_length:
        text = text[:max_length] + "..."
    
    # Remove potentially harmful characters
    text = text.replace('\x00', '')  # Remove null bytes
    
    return text.strip()

def format_error_message(error: Exception) -> str:
    """Format error message for user consumption"""
    error_msg = str(error)
    
    # Common error patterns to make more user-friendly
    if "rate limit" in error_msg.lower():
        return "You've exceeded the rate limit. Please try again later."
    
    if "authentication" in error_msg.lower() or "unauthorized" in error_msg.lower():
        return "Authentication failed. Please sign in again."
    
    if "not found" in error_msg.lower():
        return "The requested resource was not found."
    
    if "timeout" in error_msg.lower():
        return "The request timed out. Please try again."
    
    # Return original message for other errors
    return error_msg
