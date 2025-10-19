type FormType = "sign-in" | "sign-up";

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface Analysis {
  id: string;
  userId: string;
  match_score: number;
  skill_gaps: string[];
  strengths: string[];
  recommendations: string[];
  interview_focus_areas: string[];
  createdAt: Date;
  resume_text?: string;
  job_description?: string;
  social_profiles?: {
    github?: string;
    linkedin?: string;
  };
}

interface Interview {
  id: string;
  analysisId: string;
  userId: string;
  questions: string[];
  transcript?: string;
  createdAt: Date;
  status?: "pending" | "in_progress" | "completed";
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

interface AnalysisRequest {
  resume_text: string;
  job_description: string;
  social_profiles: {
    github?: string;
    linkedin?: string;
  };
}