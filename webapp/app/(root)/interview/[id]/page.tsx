"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import Vapi from "@vapi-ai/web";
import VoiceVisualizer from "@/components/dashboard/VoiceVisualizer";
import Navbar from "@/components/dashboard/Navbar";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  const apiToken = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  // Vapi State
  const [vapi] = useState(() => new Vapi(apiToken || "default-token"));
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const transcriptRef = useRef<string>("");

  const handleInterviewEnd = async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
      const finalTranscript = transcriptRef.current || "Interview completed";

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be signed in");
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          interviewId: interview?.id,
          transcript: finalTranscript,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze feedback");
      }

      router.push(`/feedback/${result.feedbackId}`);
    } catch (error) {
      console.error("Error processing interview end:", error);
      toast.error("Failed to process interview");
      setIsEnding(false);
    }
  };

  // Vapi Event Listeners
  useEffect(() => {
    if (!vapi) return;

    const onCallStart = () => {
      console.log("Call started");
      setIsCallActive(true);
      transcriptRef.current = "";
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setIsCallActive(false);
      handleInterviewEnd();
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role;
        const text = message.transcript;
        transcriptRef.current += `${role}: ${text}\n`;
      }
      
      // Update audio level for visualizer
      if (message.type === "speech-update") {
        setAudioLevel(message.status === "speaking" ? 0.8 : 0.2);
      }
    };

    const onError = (error: any) => {
      console.error("Vapi error:", error);
      toast.error(`Call error: ${error.message}`);
      setIsCallActive(false);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
    };
  }, [vapi, interview, isEnding, router]);

  // Fetch Interview Data
  useEffect(() => {
    const fetchInterview = async () => {
      if (!params.id) return;
      try {
        // Get current user token
        const currentUser = auth.currentUser;
        let idToken = "";
        if (currentUser) {
            idToken = await currentUser.getIdToken();
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/interview/${params.id}`, {
            headers: {
                "Authorization": `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch interview");
        }

        const data = await response.json();
        
        setInterview({
            id: data.interview.id,
            ...data.interview,
            questions: data.questions.map((q: any) => q.content),
            createdAt: new Date(data.interview.created_at)
        } as Interview);

      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview");
        // router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure auth is initialized or use onAuthStateChanged
    // For now, we'll just call it. If auth fails, the API might return 401, 
    // but since we allow fetching interview (maybe?), actually we enforce auth.
    // So we should probably wait for auth.
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            fetchInterview();
        } else {
            // If no user, maybe redirect or show login
            // For now, let's try to fetch anyway (might fail if API requires auth)
            // fetchInterview(); 
        }
    });
    
    return () => unsubscribe();
  }, [params.id, router]);

  const handleStartInterview = () => {
    if (interview?.questions) {
      const VAPI_ASSISTANT_ID = "fbca3bfa-f57d-42bd-9a5a-04d0579a6b25";

      const callConfig = {
        model: {
          provider: "openai" as const,
          model: "gpt-4" as const,
          messages: [
            {
              role: "system" as const,
              content: `You are a professional interview coach conducting a mock interview. 
              Your name is Riley.
              
              Here are the questions to ask: 
              - ${interview.questions.join("\n- ")}
              
              Guidelines:
              - Ask one question at a time
              - Listen to the candidate's response
              - Provide brief, encouraging feedback
              - Ask follow-up questions based on their answers
              - Keep the interview conversational and professional
              - After each answer, ask the next question
              
              Start with a warm greeting and then begin with the first question.`,
            },
          ],
        },
      };

      vapi.start(VAPI_ASSISTANT_ID, callConfig);
    }
  };

  const handleStopCall = () => {
    vapi.stop();
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
  };

  const user = {
    id: "temp",
    name: "User",
    email: "user@example.com",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-zinc-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Interview Not Found
          </h2>
          <p className="text-zinc-400 mb-6">
            The interview you're looking for doesn't exist.
          </p>
          <Link href="/" className="inline-flex px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isEnding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Processing Interview
          </h3>
          <p className="text-zinc-400">
            Analyzing your responses and generating feedback...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Conditionally render Navbar */}
      <AnimatePresence>
        {!isCallActive && <Navbar user={user} />}
      </AnimatePresence>

      <div className={`${isCallActive ? "pt-8" : "pt-24"} px-6 pb-12 transition-all duration-300`}>
        <div className="max-w-6xl mx-auto">
          {/* Header (only show when not in call) */}
          {!isCallActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">Mock Interview</h1>
              <p className="text-zinc-400">
                {interview.createdAt.toLocaleDateString("en-US", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </motion.div>
          )}

          {/* Main Interview Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Voice Visualizer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <VoiceVisualizer isActive={isCallActive} audioLevel={audioLevel} />
                
                {/* Status text below visualizer */}
                <div className="text-center mt-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isCallActive ? "Interview in Progress" : "Ready to Start"}
                  </h3>
                  <p className="text-zinc-400">
                    {isCallActive 
                      ? "Speak naturally and answer questions" 
                      : "Click start when you're ready"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Controls Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center"
            >
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                {/* Interview Questions Preview */}
                {!isCallActive && interview.questions && (
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-white mb-4">Questions</h4>
                    <div className="space-y-2">
                      {interview.questions.slice(0, 3).map((question, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                          <span className="text-sm font-mono text-zinc-500">{index + 1}</span>
                          <span className="text-sm text-zinc-300">{question}</span>
                        </div>
                      ))}
                      {interview.questions.length > 3 && (
                        <p className="text-sm text-zinc-500 text-center">
                          +{interview.questions.length - 3} more questions
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="space-y-4">
                  {!isCallActive ? (
                    <button
                      onClick={handleStartInterview}
                      className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Start Interview
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleStopCall}
                        className="w-full bg-red-500 text-white font-bold text-lg py-4 rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <PhoneOff className="w-5 h-5" />
                        End Interview
                      </button>

                      <button
                        onClick={handleToggleMute}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                          isMuted
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isMuted ? "Unmute" : "Mute"}
                      </button>
                    </>
                  )}
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {isCallActive
                      ? "💡 Take your time to think before answering. Speak clearly and confidently."
                      : "💡 Ensure you're in a quiet environment with a stable internet connection."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
