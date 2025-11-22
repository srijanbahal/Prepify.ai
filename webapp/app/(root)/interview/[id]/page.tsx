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
  Wifi,
  WifiOff,
  Play,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase/client";
import Vapi from "@vapi-ai/web";
import VoiceVisualizer from "@/components/dashboard/VoiceVisualizer";
import TranscriptDisplay from "@/components/interview/TranscriptDisplay";
import Navbar from "@/components/dashboard/Navbar";

interface TranscriptMessage {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
  isFinal?: boolean;
}

interface Interview {
  id: string;
  questions: string[];
  createdAt: Date;
  status: string;
}

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
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);
  const [currentAiText, setCurrentAiText] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const transcriptRef = useRef<string>("");

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection", {
        description: "Your interview may be interrupted.",
        icon: <WifiOff className="w-4 h-4" />,
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
      setTranscriptMessages([]);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setIsCallActive(false);
      handleInterviewEnd();
    };

    const onMessage = (message: any) => {
      // Handle Transcripts
      if (message.type === "transcript") {
        const text = message.transcript;
        const role = message.role;
        
        if (message.transcriptType === "final") {
          setTranscriptMessages(prev => [
            ...prev, 
            { role, text, timestamp: Date.now(), isFinal: true }
          ]);
          transcriptRef.current += `${role}: ${text}\n`;
          if (role === "assistant") setCurrentAiText("");
        } else {
          if (role === "assistant") setCurrentAiText(text);
        }
      }
      
      // Handle Volume Levels (Vapi sends 'volume-level' events)
      if (message.type === "volume-level") {
        // message.level is usually 0-1
        // We need to determine if it's AI or User based on who is speaking
        // This is a simplification; Vapi's volume-level event structure needs verification
        // Assuming we get separate events or can infer source
        // For now, let's use a more robust approach if Vapi supports it, 
        // otherwise fallback to speech-start/end for active state
      }

      // Alternative: Use speech-start/end for active state + random fluctuation for visualizer
      if (message.type === "speech-start") {
        if (message.role === "assistant") {
          setAiAudioLevel(0.8); // Set to high level when speaking
        } else {
          setUserAudioLevel(0.8);
        }
      }

      if (message.type === "speech-end") {
        if (message.role === "assistant") {
          setAiAudioLevel(0);
        } else {
          setUserAudioLevel(0);
        }
      }
    };
    
    // Listen for volume events directly if Vapi exposes them
    const onVolumeLevel = (level: number) => {
       // This usually captures user mic level
       if (!isMuted) setUserAudioLevel(level);
    };
    
    vapi.on("volume-level", onVolumeLevel);

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
      vapi.off("volume-level", onVolumeLevel);
    };
  }, [vapi, interview, isEnding, router, isMuted]);

  // Fetch Interview Data
  useEffect(() => {
    const fetchInterview = async () => {
      if (!params.id) return;
      try {
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
      } finally {
        setIsLoading(false);
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            fetchInterview();
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
        voice: {
          provider: "11labs" as const,
          voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (American, Clear)
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
    <div className="h-screen bg-black text-white overflow-hidden relative flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-noir-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Navbar (only when not in call) */}
      <AnimatePresence>
        {!isCallActive && <Navbar user={user} />}
      </AnimatePresence>

      <div className={`relative flex-1 flex flex-col ${isCallActive ? "p-6" : "pt-24 px-6 pb-12 overflow-y-auto"}`}>
        
        {/* Header (only show when not in call) */}
        <AnimatePresence>
          {!isCallActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto w-full mb-8"
            >
              <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2 text-glow">Mock Interview</h1>
              <p className="text-zinc-400">
                {interview?.createdAt ? new Date(interview.createdAt).toLocaleDateString("en-US", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : ""}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className={`flex-1 ${isCallActive ? "flex gap-6 h-full overflow-hidden" : "max-w-6xl mx-auto w-full flex items-center justify-center"}`}>
          
          <AnimatePresence mode="wait">
            {!isCallActive ? (
              // Pre-call View (Questions Preview)
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* ... (Pre-call content remains same) ... */}
                {/* Left: AI Intro */}
                <div className="noir-card p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-sm font-medium text-blue-400">AI Interviewer</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to start?</h2>
                    <p className="text-zinc-400 leading-relaxed">
                      I'll be conducting your interview today. We'll go through a series of questions based on your analysis. Speak clearly and take your time.
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-blue-500/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" />
                      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Mic className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Questions Preview */}
                <div className="space-y-6">
                  <div className="noir-card p-6 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Questions Preview
                    </h3>
                    <div className="space-y-3">
                      {interview?.questions?.slice(0, 3).map((question, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                          <span className="text-xs font-mono text-zinc-500 mt-1">0{index + 1}</span>
                          <p className="text-sm text-zinc-300 leading-relaxed">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                  >
                    <Phone className="w-5 h-5" />
                    Start Interview
                  </button>
                </div>
              </motion.div>
            ) : (
              // Active Call View (Split Layout)
              <div className="flex w-full h-full gap-6 pb-24"> {/* Added pb-24 for floating controls space */}
                {/* Left Column: Visualizers */}
                <div className="w-1/3 flex flex-col gap-6 h-full">
                  {/* Top: AI Visualizer */}
                  <motion.div
                    key="ai-visualizer"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 relative rounded-3xl bg-zinc-900/50 border border-white/5 overflow-hidden flex flex-col items-center justify-center noir-card"
                  >
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-sm font-medium text-zinc-400">AI Interviewer</span>
                    </div>

                    <VoiceVisualizer 
                      isActive={isCallActive && aiAudioLevel > 0} 
                      audioLevel={aiAudioLevel}
                      color="rgba(59, 130, 246, 0.9)" 
                      glowColor="rgba(59, 130, 246, 0.2)"
                    />
                  </motion.div>

                  {/* Bottom: User Visualizer */}
                  <motion.div
                    key="user-visualizer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 relative rounded-3xl bg-zinc-900/50 border border-white/5 overflow-hidden flex flex-col items-center justify-center noir-card"
                  >
                    <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                      <div className={`w-2 h-2 rounded-full ${isMuted ? "bg-red-500" : "bg-emerald-500"} animate-pulse`} />
                      <span className="text-sm font-medium text-zinc-400">You</span>
                    </div>

                    <VoiceVisualizer 
                      isActive={isCallActive && userAudioLevel > 0 && !isMuted} 
                      audioLevel={userAudioLevel}
                      color="rgba(16, 185, 129, 0.9)" 
                      glowColor="rgba(16, 185, 129, 0.2)"
                    />
                  </motion.div>
                </div>

                {/* Right Column: Chat & Transcript */}
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 relative rounded-3xl bg-zinc-900/50 border border-white/5 overflow-hidden flex flex-col noir-card h-full"
                >
                  <div className="absolute inset-0">
                    <TranscriptDisplay messages={transcriptMessages} />
                  </div>
                  
                  {/* Real-time AI Caption Overlay */}
                  <AnimatePresence>
                    {currentAiText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent"
                      >
                        <p className="text-lg font-medium text-white/90 text-glow leading-relaxed text-center">
                          "{currentAiText}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Noir Controls Bar */}
        <AnimatePresence>
          {isCallActive && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
                
                {/* Connection Strength */}
                <div className="flex items-center gap-2 px-2 border-r border-white/10 pr-6">
                  <div className="flex gap-1 items-end h-4">
                    <div className={`w-1 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-700"} h-2`} />
                    <div className={`w-1 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-700"} h-3`} />
                    <div className={`w-1 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-700"} h-4`} />
                  </div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {isOnline ? "Excellent" : "Offline"}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleToggleMute}
                    className={`p-4 rounded-xl transition-all flex items-center gap-2 font-medium ${
                      isMuted
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleStopCall}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
                  >
                    <PhoneOff className="w-5 h-5" />
                    End
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
