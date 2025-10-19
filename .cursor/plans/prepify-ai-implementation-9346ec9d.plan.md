<!-- 9346ec9d-9275-402f-ade8-fd39db7ca82c b47df334-a183-46ae-a845-5a9ba6a56e14 -->
# Prepify.ai Full Implementation Plan

## Architecture Overview

**Backend**: FastAPI + CrewAI (3 parallel agents → synthesis agent) + Redis caching + Rate limiting

**Frontend**: Next.js 15 + Firebase Auth + Firestore + Vapi AI

**AI Models**: Gemini API (main analysis) + HuggingFace Inference API (specialized tasks)

**Storage**: Redis (cache + rate limits) + Firestore (persistence)

---

## Phase 1: Backend Foundation & Infrastructure

### 1.1 FastAPI Project Structure

```
/api
├── main.py                    # FastAPI app with CORS, middleware
├── requirements.txt           # Dependencies
├── .env                       # Environment variables
├── models.py                  # Pydantic request/response models
├── config.py                  # Configuration management
├── middleware/
│   ├── rate_limiter.py       # Redis-based rate limiting
│   └── auth.py               # Firebase token verification
├── services/
│   ├── redis_service.py      # Redis connection & caching
│   ├── crew_service.py       # CrewAI orchestration
│   ├── gemini_service.py     # Gemini API wrapper with retry
│   ├── hf_service.py         # HuggingFace Inference API
│   └── profile_scraper.py    # GitHub/LinkedIn scraping
├── agents/
│   ├── resume_agent.py       # Deep resume analysis
│   ├── job_agent.py          # Job description + company culture
│   ├── social_agent.py       # GitHub/LinkedIn analysis
│   └── synthesis_agent.py    # Combines all agent outputs
├── tasks/
│   ├── resume_tasks.py       # CrewAI tasks for resume
│   ├── job_tasks.py          # CrewAI tasks for job
│   └── social_tasks.py       # CrewAI tasks for social
└── utils/
    ├── cache_keys.py         # Redis key patterns
    └── response_parser.py    # Parse agent outputs to JSON
```

### 1.2 Dependencies (`requirements.txt`)

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.0
python-dotenv==1.0.1
redis==5.2.0
crewai==0.80.0
crewai-tools==0.12.0
google-generativeai==0.8.3
huggingface-hub==0.26.0
requests==2.32.3
firebase-admin==6.5.0
slowapi==0.1.9
python-multipart==0.0.12
```

### 1.3 Core Configuration (`config.py`)

```python
GEMINI_API_KEY, GEMINI_MODEL = "gemini-2.0-flash-exp"
HF_API_KEY, HF_MODEL = "meta-llama/Llama-3.2-3B-Instruct"
REDIS_URL = "redis://localhost:6379"
RATE_LIMIT_PER_USER = "5/day"  # 5 analyses per user per day
RATE_LIMIT_GLOBAL = "100/hour"  # Global API protection
CACHE_TTL_ANALYSIS = 3600 * 24  # 24 hours
CACHE_TTL_INTERVIEW = 3600 * 2  # 2 hours
```

### 1.4 Redis Service (`services/redis_service.py`)

- Connection pool management
- Cache helper methods: `get_cached()`, `set_cached()`, `invalidate()`
- Rate limit tracking: `check_rate_limit()`, `increment_counter()`
- Analysis state storage: `store_agent_results()`, `get_agent_results()`

### 1.5 Rate Limiting Middleware (`middleware/rate_limiter.py`)

- Per-user limits: Check `userId` from Firebase token
- Global limits: Track API key usage across all users
- Redis-based sliding window counter
- Return `429 Too Many Requests` with `Retry-After` header

---

## Phase 2: CrewAI Multi-Agent System

### 2.1 Agent Definitions

**Resume Agent** (`agents/resume_agent.py`):

- Role: "Expert Resume Analyzer"
- Goal: Extract skills, experience, education, projects, achievements
- Tools: Text parsing, keyword extraction
- LLM: Gemini API
- Output: `{skills[], experience[], education[], projects[], strengths[], weaknesses[]}`

**Job Agent** (`agents/job_agent.py`):

- Role: "Job Description & Company Culture Analyst"
- Goal: Extract requirements, company culture, interview patterns
- Tools: Web search (for company info), HF fine-tuned model (company interview DB)
- LLM: Gemini API + HF Inference API
- Output: `{required_skills[], preferred_skills[], company_culture{}, interview_patterns[], difficulty_level}`

**Social Agent** (`agents/social_agent.py`):

- Role: "Social Profile Analyzer"
- Goal: Analyze GitHub repos, LinkedIn profile, contributions
- Tools: GitHub API, LinkedIn scraper (if available)
- LLM: Gemini API
- Output: `{github_stats{}, top_projects[], tech_stack[], contribution_quality}`

**Synthesis Agent** (`agents/synthesis_agent.py`):

- Role: "Career Intelligence Synthesizer"
- Goal: Combine all agent outputs into comprehensive report
- LLM: Gemini API
- Output: `{match_score, skill_gaps[], strengths[], recommendations[], interview_focus_areas[]}`

### 2.2 CrewAI Orchestration (`services/crew_service.py`)

```python
async def run_analysis(resume_text, job_desc, social_urls, user_id):
    # Check Redis cache first
    cache_key = f"analysis:{hash(resume+job+social)}"
    cached = await redis.get_cached(cache_key)
    if cached: return cached
    
    # Run 3 agents in parallel
    crew = Crew(
        agents=[resume_agent, job_agent, social_agent],
        tasks=[resume_task, job_task, social_task],
        process=Process.parallel
    )
    
    results = await crew.kickoff_async({
        "resume": resume_text,
        "job_description": job_desc,
        "social_profiles": social_urls
    })
    
    # Store intermediate results in Redis
    await redis.store_agent_results(user_id, results)
    
    # Run synthesis agent
    synthesis_crew = Crew(
        agents=[synthesis_agent],
        tasks=[synthesis_task],
        process=Process.sequential
    )
    
    final_report = await synthesis_crew.kickoff_async(results)
    
    # Cache final report
    await redis.set_cached(cache_key, final_report, ttl=CACHE_TTL_ANALYSIS)
    
    return final_report
```

### 2.3 Optimization Techniques

- **Caching**: Hash input (resume+job+social) → cache final report for 24h
- **Parallel Execution**: Run 3 agents simultaneously using CrewAI's parallel process
- **Retry Logic**: Exponential backoff for API failures (Gemini/HF)
- **Fallback**: If HF model fails, use Gemini as fallback
- **Streaming**: Not for initial analysis (too complex), but for interview questions

---

## Phase 3: API Endpoints

### 3.1 POST `/analyze`

```python
@router.post("/analyze")
@rate_limit("5/day", per_user=True)
@rate_limit("100/hour", global=True)
async def analyze(request: AnalysisRequest, user_id: str = Depends(verify_firebase_token)):
    # Validate input
    # Check rate limits (handled by decorator)
    # Run CrewAI analysis
    result = await crew_service.run_analysis(
        request.resume_text,
        request.job_description,
        request.social_profiles,
        user_id
    )
    # Return analysis_id + summary
    return {"analysis_id": result.id, "summary": result.summary}
```

### 3.2 POST `/interview/generate`

```python
@router.post("/interview/generate")
async def generate_interview(analysis_id: str, user_id: str = Depends(verify_firebase_token)):
    # Fetch analysis from Redis/Firestore
    analysis = await get_analysis(analysis_id)
    
    # Generate initial 5-7 questions based on skill gaps
    questions = await gemini_service.generate_questions(
        skill_gaps=analysis.skill_gaps,
        interview_focus=analysis.interview_focus_areas
    )
    
    # Store in Firestore
    interview_id = await firestore.create_interview(analysis_id, questions)
    
    return {"interview_id": interview_id, "initial_questions": questions}
```

### 3.3 POST `/interview/followup` (Real-time during Vapi call)

```python
@router.post("/interview/followup")
async def generate_followup(
    interview_id: str,
    conversation_history: list,
    user_id: str = Depends(verify_firebase_token)
):
    # Fetch original analysis + questions from Redis cache
    context = await redis.get_cached(f"interview_context:{interview_id}")
    
    # Generate follow-up using Gemini (fast model)
    followup = await gemini_service.generate_followup(
        context=context,
        conversation=conversation_history,
        max_tokens=150  # Keep it concise for real-time
    )
    
    return {"followup_question": followup}
```

### 3.4 POST `/feedback/analyze`

```python
@router.post("/feedback/analyze")
async def analyze_feedback(
    interview_id: str,
    transcript: str,
    user_id: str = Depends(verify_firebase_token)
):
    # Fetch analysis + questions from Firestore
    interview = await firestore.get_interview(interview_id)
    analysis = await firestore.get_analysis(interview.analysis_id)
    
    # Generate feedback using Gemini
    feedback = await gemini_service.generate_feedback(
        skill_gaps=analysis.skill_gaps,
        questions=interview.questions,
        transcript=transcript
    )
    
    # Store in Firestore
    feedback_id = await firestore.create_feedback(interview_id, feedback)
    
    return {"feedback_id": feedback_id, "summary": feedback.summary}
```

---

## Phase 4: Frontend Implementation

### 4.1 Analysis Submission (`webapp/app/(root)/analyze/page.tsx`)

- Form: Resume (textarea/file upload), Job Description (textarea), GitHub URL, LinkedIn URL
- Submit → POST to `/api/analysis/route.ts`
- Show loading state with progress indicator
- Redirect to `/report/[id]` on success

### 4.2 Next.js API Bridge (`webapp/app/api/analysis/route.ts`)

```typescript
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({error: "Unauthorized"}, {status: 401});
  
  const {resume, jobDesc, github, linkedin} = await req.json();
  
  // Call Python backend
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
    method: "POST",
    headers: {"Content-Type": "application/json", "Authorization": `Bearer ${idToken}`},
    body: JSON.stringify({
      resume_text: resume,
      job_description: jobDesc,
      social_profiles: {github, linkedin}
    })
  });
  
  const data = await response.json();
  
  // Save to Firestore
  const analysisRef = await db.collection("analyses").add({
    userId: user.id,
    ...data,
    createdAt: new Date()
  });
  
  return Response.json({analysisId: analysisRef.id});
}
```

### 4.3 Report Display (`webapp/app/(root)/report/[id]/page.tsx`)

- Fetch analysis from Firestore
- Display: Match Score (circular progress), Skill Gaps (cards), Strengths (cards), Recommendations (list)
- "Start Mock Interview" button → POST to `/api/interview/route.ts`

### 4.4 Interview Generation API (`webapp/app/api/interview/route.ts`)

```typescript
export async function POST(req: Request) {
  const {analysisId} = await req.json();
  
  // Call Python backend
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/generate`, {
    method: "POST",
    body: JSON.stringify({analysis_id: analysisId})
  });
  
  const {interview_id, initial_questions} = await response.json();
  
  // Save to Firestore
  await db.collection("interviews").doc(interview_id).set({
    analysisId,
    userId: user.id,
    questions: initial_questions,
    createdAt: new Date()
  });
  
  return Response.json({interviewId: interview_id});
}
```

### 4.5 Voice Interview Page (`webapp/app/(root)/interview/[id]/page.tsx`)

- Fetch interview questions from Firestore
- Initialize Vapi with custom assistant configuration
- Pass initial questions as context
- Configure Vapi to call `/api/interview/followup` for dynamic follow-ups
- Handle interview end → POST transcript to `/api/feedback/route.ts`

### 4.6 Vapi Configuration (`webapp/lib/vapi/config.ts`)

```typescript
export function createVapiAssistant(interviewId: string, questions: string[]) {
  return {
    model: {provider: "openai", model: "gpt-4"},
    voice: {provider: "11labs", voiceId: "professional"},
    firstMessage: `Hello! I'll be conducting your mock interview today. ${questions[0]}`,
    serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/interview/followup`,
    serverUrlSecret: process.env.VAPI_SERVER_SECRET,
    endCallFunctionEnabled: true,
    endCallMessage: "Thank you for completing the interview!"
  };
}
```

### 4.7 Feedback Generation (`webapp/app/api/feedback/route.ts`)

```typescript
export async function POST(req: Request) {
  const {interviewId, transcript} = await req.json();
  
  // Call Python backend
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/analyze`, {
    method: "POST",
    body: JSON.stringify({interview_id: interviewId, transcript})
  });
  
  const {feedback_id, summary} = await response.json();
  
  return Response.json({feedbackId: feedback_id});
}
```

### 4.8 Feedback Display (`webapp/app/(root)/feedback/[id]/page.tsx`)

- Fetch feedback from Firestore
- Display: Overall Score, Strong Points (cards), Areas to Improve (cards), Detailed Analysis (sections)

### 4.9 Dashboard (`webapp/app/page.tsx`)

- Fetch all analyses for current user
- Display as cards with: Match Score, Date, Company Name, Status (Analyzed/Interviewed/Completed)
- Click card → Navigate to report/interview/feedback based on status

### 4.10 Navigation (`webapp/components/Navbar.tsx`)

- Logo, Dashboard link, New Analysis button, User menu (Sign Out)

---

## Phase 5: Type Definitions & Data Models

### 5.1 Backend Models (`api/models.py`)

```python
class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    social_profiles: dict[str, str]  # {github, linkedin}

class AnalysisResponse(BaseModel):
    analysis_id: str
    match_score: float
    skill_gaps: list[str]
    strengths: list[str]
    recommendations: list[str]
    interview_focus_areas: list[str]

class InterviewRequest(BaseModel):
    analysis_id: str

class FollowupRequest(BaseModel):
    interview_id: str
    conversation_history: list[dict]

class FeedbackRequest(BaseModel):
    interview_id: str
    transcript: str
```

### 5.2 Frontend Types (`webapp/types/index.d.ts`)

```typescript
interface Analysis {
  id: string;
  userId: string;
  match_score: number;
  skill_gaps: string[];
  strengths: string[];
  recommendations: string[];
  interview_focus_areas: string[];
  createdAt: Date;
}

interface Interview {
  id: string;
  analysisId: string;
  userId: string;
  questions: string[];
  transcript?: string;
  createdAt: Date;
}

interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  overall_score: number;
  strong_points: string[];
  areas_to_improve: string[];
  detailed_analysis: string;
  createdAt: Date;
}
```

---

## Phase 6: Optimization & Best Practices

### 6.1 Backend Optimizations

- **Redis Caching**: Cache analysis results for 24h, interview context for 2h
- **Rate Limiting**: Per-user (5/day) + Global (100/hour) using Redis
- **Async/Await**: All I/O operations (DB, API calls) are async
- **Connection Pooling**: Redis connection pool, HTTP session reuse
- **Error Handling**: Try-catch with exponential backoff for API calls
- **Logging**: Structured logging with request IDs for tracing
- **Health Checks**: `/health` endpoint for monitoring

### 6.2 Frontend Optimizations

- **Loading States**: Skeleton loaders for all async operations
- **Error Boundaries**: Catch and display errors gracefully
- **Optimistic Updates**: Update UI before backend confirmation
- **Debouncing**: Debounce form inputs to reduce API calls
- **Code Splitting**: Lazy load heavy components (Vapi, charts)

### 6.3 Code Quality

- **Backend**: Type hints, Pydantic validation, docstrings, pytest tests
- **Frontend**: TypeScript strict mode, ESLint, Prettier, component tests
- **Git**: Conventional commits, feature branches, PR reviews

---

## Setup & Testing Instructions

### Backend Setup

1. **Install Redis**: `docker run -d -p 6379:6379 redis:alpine` or Windows installer
2. **Navigate to `/api`**: `cd api`
3. **Create venv**: `python -m venv venv`
4. **Activate**: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
5. **Install deps**: `pip install -r requirements.txt`
6. **Create `.env`**:
```
GEMINI_API_KEY=your_gemini_key
HF_API_KEY=your_hf_key
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
```

7. **Run**: `uvicorn main:app --reload --port 8000`
8. **Test**: `curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" -d '{"resume_text":"...","job_description":"...","social_profiles":{"github":"..."}}'`

### Frontend Setup

1. **Navigate to `/webapp`**: `cd webapp`
2. **Install deps**: `npm install`
3. **Update `.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_key
VAPI_SERVER_SECRET=your_vapi_secret
```

4. **Run**: `npm run dev`
5. **Visit**: `http://localhost:3000`

### Full Flow Test

1. **Sign in**: Navigate to `/sign-in`, create account
2. **Submit analysis**: Go to `/analyze`, paste resume + job description + GitHub URL
3. **View report**: Redirected to `/report/[id]`, see match score and gaps
4. **Start interview**: Click button, redirected to `/interview/[id]`
5. **Voice interview**: Speak with Vapi agent, answer questions
6. **View feedback**: After interview ends, redirected to `/feedback/[id]`
7. **Dashboard**: Return to `/`, see all past analyses

### Performance Testing

- **Load test**: Use `locust` or `k6` to simulate 100 concurrent users
- **Rate limit test**: Verify 429 responses after exceeding limits
- **Cache test**: Check Redis for cached analysis results
- **Latency test**: Measure response times for each endpoint

### Deployment

**Backend to Render**:

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

2. Push to GitHub, connect Render, deploy
3. Update `webapp/.env.local`: `NEXT_PUBLIC_API_URL=https://prepify-api.onrender.com`

**Frontend to Vercel**:

1. Push to GitHub
2. Connect Vercel, select `/webapp` as root
3. Add environment variables in Vercel dashboard

---

## Commit History (Chronological)

```
1. chore: initialize backend structure and dependencies
   - Create /api directory with FastAPI boilerplate
   - Add requirements.txt with CrewAI, Redis, Gemini
   - Set up .env.example and config.py

2. feat: implement Redis service and rate limiting
   - Add redis_service.py with caching helpers
   - Create rate_limiter.py middleware
   - Add per-user and global rate limits

3. feat: build CrewAI multi-agent system
   - Create resume_agent.py, job_agent.py, social_agent.py
   - Implement synthesis_agent.py
   - Add crew_service.py for orchestration

4. feat: add Gemini and HuggingFace API wrappers
   - Create gemini_service.py with retry logic
   - Add hf_service.py for inference API
   - Implement fallback mechanisms

5. feat: implement /analyze endpoint
   - Add main.py with FastAPI routes
   - Create models.py for request/response validation
   - Integrate CrewAI analysis flow

6. feat: add interview generation endpoints
   - Create /interview/generate endpoint
   - Add /interview/followup for dynamic questions
   - Implement caching for interview context

7. feat: implement feedback analysis endpoint
   - Add /feedback/analyze route
   - Integrate Gemini for feedback generation
   - Store results in Firestore

8. feat: create analysis submission page
   - Add webapp/app/(root)/analyze/page.tsx
   - Build form with resume, job desc, social inputs
   - Create webapp/app/api/analysis/route.ts bridge

9. feat: implement report display page
   - Create webapp/app/(root)/report/[id]/page.tsx
   - Design match score visualization
   - Add skill gaps and strengths cards

10. feat: build interview generation flow
    - Create webapp/app/api/interview/route.ts
    - Add interview question display
    - Integrate with backend /interview/generate

11. feat: integrate Vapi voice interview
    - Create webapp/app/(root)/interview/[id]/page.tsx
    - Add webapp/lib/vapi/config.ts
    - Implement dynamic follow-up calls

12. feat: add feedback generation and display
    - Create webapp/app/api/feedback/route.ts
    - Build webapp/app/(root)/feedback/[id]/page.tsx
    - Display detailed feedback analysis

13. feat: build main dashboard
    - Update webapp/app/page.tsx with analysis list
    - Create analysis cards component
    - Add navigation to reports/interviews/feedback

14. feat: add navbar and layout improvements
    - Create webapp/components/Navbar.tsx
    - Update webapp/app/(root)/layout.tsx
    - Add authentication protection

15. feat: extend type definitions
    - Update webapp/types/index.d.ts
    - Add Analysis, Interview, Feedback interfaces
    - Ensure type safety across app

16. test: add backend unit tests
    - Create tests/ directory
    - Add pytest tests for agents and services
    - Test rate limiting and caching

17. fix: improve error handling
    - Add try-catch blocks to all routes
    - Implement exponential backoff for API calls
    - Add user-friendly error messages

18. perf: optimize API response times
    - Implement Redis caching for analysis
    - Add connection pooling
    - Optimize CrewAI parallel execution

19. style: polish UI and responsive design
    - Refine component layouts
    - Add loading skeletons
    - Ensure mobile responsiveness

20. docs: add comprehensive documentation
    - Create README.md with setup instructions
    - Add API documentation
    - Document deployment process

21. chore: prepare for deployment
    - Create render.yaml for backend
    - Add vercel.json for frontend
    - Set up environment variable templates
```

### To-dos

- [ ] Set up FastAPI backend with /analyze endpoint and Smart ATS integration
- [ ] Create analysis submission page and Next.js API bridge to Python backend
- [ ] Build report display page to show analysis results from Firestore
- [ ] Implement interview question generation using Gemini AI
- [ ] Create voice interview page with Vapi AI integration
- [ ] Build feedback generation and display system
- [ ] Create main dashboard and navigation components
- [ ] Add error handling, polish UI, and prepare for deployment