"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Calendar,
  Briefcase,
  Github,
  Linkedin,
  Loader2,
  Building2,
  FileText,
  Code,
  History
} from "lucide-react";
import { auth } from "@/lib/firebase/client";
import Accordion from "@/components/ui/Accordion";
import { motion } from "framer-motion";

interface Interview {
  id: string;
  created_at: string;
  overall_score?: number;
  status: string;
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
  interviews?: Interview[];
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!params.id) return;

      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error("Please sign in to view analysis");
          router.push("/sign-in");
          return;
        }

        const idToken = await user.getIdToken();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analysis/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Analysis not found");
          } else if (response.status === 403) {
            toast.error("Access denied");
          } else {
            toast.error("Failed to load analysis");
          }
          router.push("/");
          return;
        }

        const data = await response.json();
        
        const synthesis = data.synthesis_result || {};
        setAnalysis({
          id: data.id,
          userId: data.user_id,
          match_score: data.match_score || 0,
          skill_gaps: synthesis.skill_gaps || [],
          strengths: synthesis.strengths || [],
          recommendations: synthesis.recommendations || [],
          interview_focus_areas: synthesis.interview_focus_areas || [],
          createdAt: new Date(data.created_at),
          resume_text: data.resume_text,
          job_description: data.job_description,
          social_profiles: {
            github: data.github_url,
            linkedin: data.linkedin_url,
          },
          interviews: data.interviews,
        });
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Failed to load analysis");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id, router]);
  
  const handleStartInterview = async () => {
    setIsGeneratingInterview(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in to start interview");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/interview/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          analysis_id: analysis?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to generate interview");
      }

      router.push(`/interview/${result.interview_id}`);
    } catch (error) {
      console.error("Error generating interview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate interview");
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (score >= 5) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 5) return "Average";
    return "Needs Work";
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-zinc-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          Analysis Not Found
        </h2>
        <p className="text-zinc-400 mb-6">
          The analysis you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/" className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Mock metrics for the "Analysis Results" section
  const metrics = [
    { label: "ATS Compatibility", score: 9 },
    { label: "Job Match", score: Math.round((analysis.match_score / 100) * 10) },
    { label: "Writing & Formatting", score: 8 },
    { label: "Keyword Coverage", score: 4 },
    { label: "Additional Insights", score: 7 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">
            Analysis Report
          </h1>
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(analysis.createdAt)}</span>
            </div>
          </div>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Back to Dashboard
        </Link>
      </div>

      {/* Analysis Results Accordion */}
      <Accordion 
        title="Analysis Results" 
        icon={TrendingUp} 
        defaultOpen={true}
        rightContent={
          <div className="text-sm text-zinc-400">
            Overall Score: <span className="text-white font-bold">{Math.round(analysis.match_score / 10)}/10</span>
          </div>
        }
      >
        <div className="space-y-6">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {metric.label}
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getScoreColor(metric.score)}`}>
                      {getScoreLabel(metric.score)}
                    </span>
                    <span className="text-sm font-mono text-zinc-500 w-8 text-right">
                      {metric.score}/10
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score * 10}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      metric.score >= 8 ? "bg-emerald-500" : 
                      metric.score >= 5 ? "bg-yellow-500" : "bg-red-500"
                    }`} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Interview History */}
      {analysis.interviews && analysis.interviews.length > 0 && (
        <Accordion title="Interview History" icon={History} defaultOpen={true}>
          <div className="space-y-3">
            {analysis.interviews.map((interview, index) => (
              <Link 
                key={interview.id} 
                href={`/feedback/${interview.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    interview.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {interview.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      Mock Interview #{analysis.interviews!.length - index}
                    </h4>
                    <p className="text-sm text-zinc-500">
                      {new Date(interview.created_at).toLocaleDateString()} • {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {interview.overall_score && (
                    <div className="text-right">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider">Score</div>
                      <div className="font-bold text-white">{interview.overall_score}/10</div>
                    </div>
                  )}
                  <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </Accordion>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Accordion title="Your Strengths" icon={CheckCircle} defaultOpen={true}>
          <div className="space-y-3">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-zinc-300">{strength}</p>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Areas to Improve" icon={AlertCircle} defaultOpen={true}>
          <div className="space-y-3">
            {analysis.skill_gaps.map((gap, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <Target className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-zinc-300">{gap}</p>
              </div>
            ))}
          </div>
        </Accordion>
      </div>

      {/* GitHub Insights */}
      {analysis.social_profiles?.github && (
        <Accordion title="GitHub Insights" icon={Github}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-5 h-5 text-zinc-400" />
                <h4 className="font-bold text-white">Code Quality Analysis</h4>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Based on your recent repositories, your code shows strong modularity. Consider adding more comprehensive documentation and unit tests to your pinned projects.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">Clean Code</span>
                <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">Modern Stack</span>
              </div>
            </div>
          </div>
        </Accordion>
      )}

      {/* LinkedIn Insights */}
      {analysis.social_profiles?.linkedin && (
        <Accordion title="LinkedIn Insights" icon={Linkedin}>
           <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-5 h-5 text-zinc-400" />
                <h4 className="font-bold text-white">Professional Presence</h4>
              </div>
              <p className="text-sm text-zinc-400">
                Your profile is well-structured. To improve visibility, consider adding more specific metrics to your experience descriptions (e.g., "Increased performance by 20%").
              </p>
            </div>
          </div>
        </Accordion>
      )}

      {/* Company Insights (Placeholder) */}
      <Accordion title="Company Insights" icon={Building2}>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-zinc-400 mb-4">
            Insights about the company culture and values will appear here based on the job description provided.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Culture</div>
              <div className="text-white font-medium">Innovation-driven</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Pace</div>
              <div className="text-white font-medium">Fast-paced</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Focus</div>
              <div className="text-white font-medium">Product Quality</div>
            </div>
          </div>
        </div>
      </Accordion>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Accordion title="Recommendations" icon={FileText} defaultOpen={true}>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <ArrowRight className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-zinc-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Interview Focus Areas - Action Card */}
      {analysis.interview_focus_areas && analysis.interview_focus_areas.length > 0 && (
        <div className="noir-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Ready to Practice?</h3>
                <p className="text-zinc-400">Based on your analysis, we've prepared a custom mock interview.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {analysis.interview_focus_areas.slice(0, 4).map((area, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span className="text-sm text-zinc-300">{area}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartInterview}
              disabled={isGeneratingInterview}
              className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingInterview ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Interview...
                </>
              ) : (
                <>
                  Start Mock Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}