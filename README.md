# Prepify.ai - AI-Powered Career Analysis & Interview Preparation Platform

![Prepify.ai Logo](https://via.placeholder.com/400x100/1a1a1a/ffffff?text=Prepify.ai)

Prepify.ai is a comprehensive career intelligence platform that leverages advanced AI to analyze resumes, job descriptions, and social profiles to provide personalized interview preparation and career guidance. Built with Next.js 15, FastAPI, and cutting-edge AI models including Gemini and CrewAI.

## 🚀 Features

### 🧠 Intelligent Career Analysis
- **Multi-Agent AI System**: 4 specialized AI agents working in parallel
  - Resume Analyzer: Extracts skills, experience, education, and achievements
  - Job Description Analyzer: Identifies requirements, company culture, and interview patterns
  - Social Profile Analyzer: Analyzes GitHub and LinkedIn profiles for technical insights
  - Synthesis Agent: Combines all analyses into comprehensive career intelligence

### 🎯 Personalized Interview Preparation
- **Dynamic Question Generation**: AI-generated questions based on skill gaps and job requirements
- **Real-time Follow-up Questions**: Intelligent follow-up questions during mock interviews
- **Voice-Enabled Interviews**: Powered by Vapi AI for natural conversation flow
- **Comprehensive Feedback**: Detailed analysis of interview performance with actionable insights

### 📊 Advanced Analytics
- **Match Score Calculation**: AI-powered compatibility scoring between candidate and position
- **Skill Gap Analysis**: Identifies specific areas for improvement
- **Strength Recognition**: Highlights key strengths to leverage
- **Personalized Recommendations**: Actionable career development suggestions

### 🔒 Enterprise-Grade Security
- **Firebase Authentication**: Secure user management and token verification
- **Rate Limiting**: Per-user and global rate limiting to prevent abuse
- **Redis Caching**: High-performance caching for optimal response times
- **Input Validation**: Comprehensive data validation and sanitization

## 🏗️ Architecture

### Frontend (Next.js 15)
```
/webapp
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   └── api/               # Next.js API routes (bridge to Python backend)
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

### Backend (FastAPI + CrewAI)
```
/api
├── main.py                # FastAPI application
├── models.py              # Pydantic data models
├── config.py              # Configuration management
├── middleware/            # Rate limiting and authentication
├── services/              # Core business logic
├── agents/                # CrewAI multi-agent system
└── utils/                 # Utility functions
```

### AI & Data Layer
- **Gemini API**: Primary AI model for analysis and content generation
- **HuggingFace Inference API**: Specialized company culture analysis
- **CrewAI**: Multi-agent orchestration framework
- **Redis**: Caching and rate limiting
- **Firestore**: Data persistence and user management

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Auth** - Authentication and user management
- **Vapi AI** - Voice AI for interviews
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **FastAPI** - High-performance Python web framework
- **CrewAI** - Multi-agent AI orchestration
- **Pydantic** - Data validation and serialization
- **Redis** - Caching and rate limiting
- **Google Gemini API** - AI analysis and content generation
- **HuggingFace API** - Specialized AI models
- **Firebase Admin SDK** - Backend authentication

### Infrastructure
- **Docker** - Containerization
- **Redis** - In-memory data store
- **Firebase** - Authentication and database
- **Vercel** - Frontend deployment
- **Render** - Backend deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Redis server
- Firebase project
- Gemini API key
- HuggingFace API key
- Vapi API key

### 1. Clone the Repository
```bash
git clone https://github.com/srijanbahal/prepify-ai.git
cd prepify-ai
```

### 2. Backend Setup
```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start Redis (using Docker)
docker run -d -p 6379:6379 redis:alpine

# Run the backend
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd webapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the frontend
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📖 Usage Guide

### 1. Career Analysis
1. **Sign Up/Login** using Firebase authentication
2. **Submit Analysis** with your resume, job description, and social profiles
3. **View Results** including match score, skill gaps, and recommendations
4. **Generate Interview** questions based on the analysis

### 2. Mock Interview
1. **Start Interview** with AI-powered voice assistant
2. **Answer Questions** naturally through voice conversation
3. **Receive Follow-ups** with intelligent follow-up questions
4. **End Interview** to generate comprehensive feedback

### 3. Feedback & Improvement
1. **Review Feedback** with detailed performance analysis
2. **Identify Strengths** and areas for improvement
3. **Get Recommendations** for skill development
4. **Track Progress** across multiple interviews

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
HF_API_KEY=your_huggingface_api_key
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
DEBUG=true
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_SERVER_SECRET=your_vapi_server_secret
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `/webapp`
3. Add environment variables
4. Deploy

### Redis (Redis Cloud)
1. Create a Redis Cloud account
2. Create a new database
3. Copy the connection string
4. Update `REDIS_URL` in your backend environment

## 📊 API Documentation

### Core Endpoints

#### POST `/analyze`
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

#### POST `/interview/generate`
Generate interview questions based on analysis.

#### POST `/interview/followup`
Generate follow-up questions during interview.

#### POST `/feedback/analyze`
Analyze interview transcript and generate feedback.

## 🧪 Testing

### Backend Testing
```bash
cd api
pytest tests/
```

### Frontend Testing
```bash
cd webapp
npm run test
```

### Load Testing
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run load-tests.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure all tests pass before submitting PR

## 📈 Performance

### Backend Optimizations
- **Redis Caching**: 24h cache for analysis results
- **Parallel Processing**: CrewAI agents run in parallel
- **Connection Pooling**: Optimized database connections
- **Rate Limiting**: Prevents abuse and ensures fair usage

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Aggressive caching strategies
- **Bundle Analysis**: Regular bundle size monitoring

## 🔒 Security

- **Authentication**: Firebase token verification
- **Rate Limiting**: Per-user and global limits
- **Input Validation**: Comprehensive data validation
- **CORS**: Properly configured cross-origin requests
- **Error Handling**: Secure error messages
- **Data Sanitization**: Input sanitization and validation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **CrewAI** for multi-agent orchestration
- **Vapi AI** for voice interview capabilities
- **HuggingFace** for specialized AI models
- **Next.js** and **FastAPI** communities for excellent frameworks


## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Multi-agent AI analysis system
- [x] Voice-enabled mock interviews
- [x] Comprehensive feedback system
- [x] User authentication and management

### Phase 2: Advanced Features 🚧
- [ ] Company-specific interview databases
- [ ] Advanced analytics dashboard
- [ ] Integration with job boards
- [ ] Mobile application

### Phase 3: Enterprise Features 📋
- [ ] Team collaboration tools
- [ ] Custom AI model training
- [ ] Advanced reporting and analytics
- [ ] API for third-party integrations

---

**Built with ❤️ by the Prepify.ai**

*Empowering careers through AI-driven insights and personalized preparation.*
