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
  Loader2
} from "lucide-react";
import { db } from "@/lib/firebase/admin";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const docRef = db.collection("analyses").doc(params.id as string);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
          const data = docSnap.data();
          setAnalysis({
            id: docSnap.id,
            ...data,
            createdAt: data?.createdAt?.toDate() || new Date()
          } as Analysis);
        } else {
          toast.error("Analysis not found");
          router.push("/");
        }
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
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisId: analysis?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate interview");
      }

      router.push(`/interview/${result.interviewId}`);
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

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    return "text-destructive-100";
  };

  const getMatchBgColor = (score: number) => {
    if (score >= 80) return "bg-success-100/20";
    if (score >= 60) return "bg-yellow-400/20";
    return "bg-destructive-100/20";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-100 mx-auto mb-4" />
          <p className="text-light-100">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive-100 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-primary-100 mb-2">
          Analysis Not Found
        </h2>
        <p className="text-light-100 mb-6">
          The analysis you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-100 mb-2">
            Analysis Report
          </h1>
          <div className="flex items-center gap-4 text-light-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(analysis.createdAt)}</span>
            </div>
            {analysis.social_profiles?.github && (
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub included</span>
              </div>
            )}
            {analysis.social_profiles?.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                <span className="text-sm">LinkedIn included</span>
              </div>
            )}
          </div>
        </div>
        <Link href="/" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {/* Match Score */}
      <div className="card-border">
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-200/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary-100" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-primary-100">
                  Overall Match Score
                </h2>
                <p className="text-light-100">
                  How well your profile matches the job requirements
                </p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl ${getMatchBgColor(analysis.match_score)}`}>
              <span className={`text-5xl font-bold ${getMatchColor(analysis.match_score)}`}>
                {Math.round(analysis.match_score)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-dark-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                analysis.match_score >= 80
                  ? "bg-success-100"
                  : analysis.match_score >= 60
                  ? "bg-yellow-400"
                  : "bg-destructive-100"
              }`}
              style={{ width: `${analysis.match_score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success-100/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success-100" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100">
                Your Strengths
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-success-100 mt-1 flex-shrink-0" />
                  <p className="text-light-100">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive-100/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive-100" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100">
                Areas to Improve
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.skill_gaps.map((gap, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-destructive-100 mt-1 flex-shrink-0" />
                  <p className="text-light-100">{gap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-200/20 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary-100" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100">
                Recommendations
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 text-primary-100 mt-1 flex-shrink-0" />
                  <p className="text-light-100">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interview Focus Areas */}
      {analysis.interview_focus_areas && analysis.interview_focus_areas.length > 0 && (
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-200/20 rounded-lg">
                  <Target className="w-5 h-5 text-primary-100" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-100">
                    Interview Focus Areas
                  </h3>
                  <p className="text-light-100 text-sm">
                    Topics likely to be covered in your interview
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartInterview}
                disabled={isGeneratingInterview}
                className="btn-primary flex items-center gap-2"
              >
                {isGeneratingInterview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Start Mock Interview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.interview_focus_areas.map((area, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-dark-200 rounded-lg">
                  <div className="w-2 h-2 bg-primary-100 rounded-full flex-shrink-0" />
                  <span className="text-light-100">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
