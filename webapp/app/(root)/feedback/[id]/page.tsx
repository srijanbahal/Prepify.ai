"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Calendar,
  Target,
  Star,
  ArrowLeft,
  Loader2,
  Download
} from "lucide-react";
// Import the client-side db instance and functions
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!params.id) return;

      try {
        // Use the client-side functions to get the document
        const docRef = doc(db, "feedback", params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFeedback({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
          } as Feedback);
        } else {
          toast.error("Feedback not found");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast.error("Failed to load feedback");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [params.id, router]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    return "text-destructive-100";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-success-100/20";
    if (score >= 60) return "bg-yellow-400/20";
    return "bg-destructive-100/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const renderStars = (score: number) => {
    const stars = [];
    const filledStars = Math.floor(score / 20);
    const hasHalfStar = (score % 20) >= 10;

    for (let i = 0; i < 5; i++) {
      if (i < filledStars) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === filledStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-400" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-100 mx-auto mb-4" />
          <p className="text-light-100">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive-100 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-primary-100 mb-2">
          Feedback Not Found
        </h2>
        <p className="text-light-100 mb-6">
          The feedback you're looking for doesn't exist or has been deleted.
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
          <div className="flex items-center gap-4 mb-2">
            <Link href="/" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 text-light-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(feedback.createdAt)}</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-100">
            Interview Feedback
          </h1>
          <p className="text-light-100 mt-2">
            Detailed analysis of your mock interview performance
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Overall Score */}
      <div className="card-border">
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-200/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary-100" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-primary-100">
                  Overall Performance
                </h2>
                <p className="text-light-100">
                  Your interview performance score
                </p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl ${getScoreBgColor(feedback.overall_score)}`}>
              <span className={`text-5xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                {Math.round(feedback.overall_score)}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {renderStars(feedback.overall_score)}
              </div>
              <p className="text-lg font-semibold text-primary-100">
                {getScoreLabel(feedback.overall_score)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-8 h-8 text-primary-100" />
              </div>
              <p className="text-sm text-light-100">Interview Analysis</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-8 h-8 text-primary-100" />
              </div>
              <p className="text-sm text-light-100">Performance Insights</p>
            </div>
          </div>

          <div className="mt-6 w-full bg-dark-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                feedback.overall_score >= 80
                  ? "bg-success-100"
                  : feedback.overall_score >= 60
                  ? "bg-yellow-400"
                  : "bg-destructive-100"
              }`}
              style={{ width: `${feedback.overall_score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strong Points */}
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success-100/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success-100" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100">
                What You Did Well
              </h3>
            </div>
            <div className="space-y-3">
              {feedback.strong_points.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-success-100 mt-1 flex-shrink-0" />
                  <p className="text-light-100">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Areas to Improve */}
        <div className="card-border">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive-100/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive-100" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100">
                Areas for Improvement
              </h3>
            </div>
            <div className="space-y-3">
              {feedback.areas_to_improve.map((area, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 text-destructive-100 mt-1 flex-shrink-0" />
                  <p className="text-light-100">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="card-border">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-200/20 rounded-lg">
              <Target className="w-5 h-5 text-primary-100" />
            </div>
            <h3 className="text-xl font-semibold text-primary-100">
              Detailed Analysis
            </h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="text-light-100 leading-relaxed whitespace-pre-wrap">
              {feedback.detailed_analysis}
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card-border">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-200/20 rounded-lg">
                <Target className="w-5 h-5 text-primary-100" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100">
                Next Steps
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/analyze" className="btn-primary text-center">
              New Analysis
            </Link>
            <Link href="/" className="btn-secondary text-center">
              View All Analyses
            </Link>
            <button className="btn-secondary text-center">
              Schedule Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}