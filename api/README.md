# Prepify.ai Backend API

This is the FastAPI backend for Prepify.ai, an AI-powered career analysis and interview preparation platform.

## Features

- **Multi-Agent Analysis**: Uses CrewAI with 4 specialized agents (Resume, Job, Social, Synthesis)
- **AI Integration**: Gemini API for main analysis, HuggingFace for specialized tasks
- **Caching**: Redis-based caching for performance optimization
- **Rate Limiting**: Per-user and global rate limiting with Redis
- **Authentication**: Firebase token verification
- **Real-time**: Support for dynamic interview follow-up questions

## Architecture

```
/api
├── main.py                    # FastAPI app with routes
├── requirements.txt           # Dependencies
├── config.py                  # Configuration management
├── models.py                  # Pydantic request/response models
├── middleware/
│   └── rate_limiter.py       # Rate limiting and auth middleware
├── services/
│   ├── redis_service.py      # Redis connection & caching
│   ├── crew_service.py       # CrewAI orchestration
│   ├── gemini_service.py     # Gemini API wrapper
│   ├── hf_service.py         # HuggingFace Inference API
│   └── profile_scraper.py    # GitHub/LinkedIn scraping
├── agents/
│   ├── resume_agent.py       # Resume analysis agent
│   ├── job_agent.py          # Job description analysis agent
│   ├── social_agent.py       # Social profile analysis agent
│   └── synthesis_agent.py    # Synthesis agent
└── utils/
    ├── cache_keys.py         # Redis key patterns
    └── response_parser.py    # Response parsing utilities
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Redis server
- Firebase project with service account
- Gemini API key
- HuggingFace API key

### 2. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the `/api` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your_huggingface_api_key_here
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
DEBUG=true
```

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

### 5. Run the API

```bash
# Development mode
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST `/analyze`
Analyze resume, job description, and social profiles.

**Request:**
```json
{
  "resume_text": "Resume content...",
  "job_description": "Job description...",
  "social_profiles": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username"
  }
}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "match_score": 0.85,
  "skill_gaps": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["rec1", "rec2"],
  "interview_focus_areas": ["area1", "area2"],
  "summary": "Analysis summary"
}
```

### POST `/interview/generate`
Generate interview questions based on analysis.

**Request:**
```json
{
  "analysis_id": "uuid"
}
```

**Response:**
```json
{
  "interview_id": "uuid",
  "initial_questions": ["Question 1", "Question 2", ...]
}
```

### POST `/interview/followup`
Generate follow-up questions during interview.

**Request:**
```json
{
  "interview_id": "uuid",
  "conversation_history": [
    {"role": "user", "content": "Answer..."},
    {"role": "assistant", "content": "Question..."}
  ]
}
```

**Response:**
```json
{
  "followup_question": "Follow-up question text"
}
```

### POST `/feedback/analyze`
Analyze interview transcript and generate feedback.

**Request:**
```json
{
  "interview_id": "uuid",
  "transcript": "Interview transcript..."
}
```

**Response:**
```json
{
  "feedback_id": "uuid",
  "summary": "Feedback summary",
  "overall_score": 0.75,
  "strong_points": ["point1", "point2"],
  "areas_to_improve": ["area1", "area2"],
  "detailed_analysis": "Detailed feedback..."
}
```

### GET `/analysis/{analysis_id}`
Retrieve analysis results by ID.

### GET `/health`
Health check endpoint.

## Rate Limiting

- **Per User**: 5 analyses per day
- **Global**: 100 requests per hour
- Uses Redis sliding window counters
- Returns `429 Too Many Requests` with `Retry-After` header

## Caching

- **Analysis Results**: Cached for 24 hours
- **Interview Context**: Cached for 2 hours
- **Rate Limit Counters**: TTL based on limit type
- Cache keys use MD5 hash of input content

## Error Handling

- Global exception handler for unhandled errors
- Structured error responses
- Detailed logging for debugging
- User-friendly error messages

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test analysis endpoint (requires authentication)
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "resume_text": "Sample resume...",
    "job_description": "Sample job description...",
    "social_profiles": {
      "github": "https://github.com/username",
      "linkedin": "https://linkedin.com/in/username"
    }
  }'
```

## Deployment

### Using Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: prepify-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GEMINI_API_KEY
      - key: HF_API_KEY
      - key: REDIS_URL
        fromService: {name: prepify-redis, property: connectionString}
  - type: redis
    name: prepify-redis
    plan: starter
```

2. Push to GitHub and connect Render

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Monitoring

- Health check endpoint: `/health`
- Structured logging with request IDs
- Error tracking and monitoring
- Performance metrics via Redis

## Security

- Firebase token verification
- Rate limiting per user and globally
- Input validation with Pydantic
- CORS configuration
- Error message sanitization
