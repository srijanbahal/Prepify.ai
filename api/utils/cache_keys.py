# Redis cache key patterns
class CacheKeys:
    ANALYSIS = "analysis"
    AGENT_RESULTS = "agent_results"
    INTERVIEW_CONTEXT = "interview_context"
    RATE_LIMIT_USER = "rate_limit:user"
    RATE_LIMIT_GLOBAL = "rate_limit:global"

# Response parsing utilities
def parse_agent_output(output: str) -> dict:
    """Parse agent output string to dictionary"""
    import json
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        # If not JSON, return as text
        return {"raw_output": output}

def extract_json_from_text(text: str) -> dict:
    """Extract JSON object from text that might contain other content"""
    import json
    import re
    
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
