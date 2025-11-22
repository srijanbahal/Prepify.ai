"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, TrendingUp, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";

interface Feedback {
  feedbackId: string;
  summary: string;
  overallScore: number;
  strongPoints: string[];
  areasToImprove: string[];
  detailedAnalysis: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push("/sign-in");
          return;
        }

        const idToken = await currentUser.getIdToken();
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const response = await fetch(`${backendUrl}/feedback/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }

        const data = await response.json();
        
        // Transform backend response (snake_case) to frontend interface (camelCase)
        setFeedback({
          feedbackId: data.feedback_id,
          summary: data.summary,
          overallScore: data.overall_score,
          strongPoints: data.strong_points || [],
          areasToImprove: data.areas_to_improve || [],
          detailedAnalysis: data.detailed_analysis
        });
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast.error("Failed to load feedback");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-zinc-400">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-white mb-2">Feedback Not Found</h2>
        <p className="text-zinc-400 mb-6">The feedback you're looking for doesn't exist.</p>
        <Link href="/" className="inline-flex px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Interview Feedback</h1>
        <p className="text-zinc-400">Here's your performance analysis from the mock interview.</p>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Overall Performance Score</p>
          </div>
          <h2 className="text-6xl font-bold text-white mb-2">{Math.round(feedback.overallScore)}%</h2>
          <p className="text-zinc-300">{feedback.summary}</p>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Strong Points */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Strong Points</h3>
          </div>
          <ul className="space-y-2">
            {feedback.strongPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-zinc-300">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Areas to Improve */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Areas to Improve</h3>
          </div>
          <ul className="space-y-2">
            {feedback.areasToImprove.map((area, index) => (
              <li key={index} className="flex items-start gap-2 text-zinc-300">
                <span className="text-orange-400 mt-1">→</span>
                <span className="text-sm">{area}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Detailed Analysis</h3>
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{feedback.detailedAnalysis}</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/analyze"
          className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
        >
          New Analysis
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold border border-white/10 hover:bg-white/20 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}