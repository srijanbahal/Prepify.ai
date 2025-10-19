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
  Volume2, 
  VolumeX,
  ArrowLeft,
  Loader2,
  MessageSquare
} from "lucide-react";
// Import the client-side db instance and functions
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

// Vapi imports
import useVapi  from "@vapi-ai/web";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  // const { vapiInstance } = useVapi(apiToken);
  const apiToken = process.env.VAPI_API_TOKEN;
  
// Option 3: Provide a default value
const {
  isCallActive,
  isCallEnded,
  isMuted,
  isDeafened,
  startCall,
  endCall,
  mute,
  unmute,
  deafen,
  undeafen,
  toggleCall,
  vapiInstance,
} = new useVapi(apiToken || 'default-token');

const call = vapiInstance;

  useEffect(() => {
    const fetchInterview = async () => {
      if (!params.id) return;
      try {
        // Use the client-side functions to get the document
        const docRef = doc(db, "interviews", params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setInterview({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
          } as Interview);
        } else {
          toast.error("Interview not found");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [params.id, router]);

  // Handle interview end
  useEffect(() => {
    if (isCallEnded && interview) {
      handleInterviewEnd();
    }
  }, [isCallEnded, interview]);

  const handleInterviewEnd = async () => {
    setIsEnding(true);
    
    try {
      // Get transcript from Vapi
      const transcript = call?.transcript || "Interview completed";
      
      // Send transcript for feedback analysis
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: interview?.id,
          transcript,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze feedback");
      }

      // Redirect to feedback page
      router.push(`/feedback/${result.feedbackId}`);
    } catch (error) {
      console.error("Error processing interview end:", error);
      toast.error("Failed to process interview");
    } finally {
      setIsEnding(false);
    }
  };

  const handleStartInterview = () => {
    if (interview?.questions) {
      // Configure Vapi assistant
      const assistantConfig = {
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a professional interview coach conducting a mock interview. 
              Here are the questions to ask: ${interview.questions.join(", ")}
              
              Guidelines:
              - Ask one question at a time
              - Listen to the candidate's response
              - Provide brief, encouraging feedback
              - Ask follow-up questions based on their answers
              - Keep the interview conversational and professional
              - After each answer, ask the next question
              - If the candidate asks for clarification, provide it briefly
              
              Start with a warm greeting and then begin with the first question.`
            }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: "professional",
        },
        firstMessage: `Hello! I'm your interview coach today. I'll be asking you a series of questions to help you practice for your upcoming interview. Are you ready to begin?`,
        endCallFunctionEnabled: true,
        endCallMessage: "Thank you for completing the interview! Your feedback will be ready shortly.",
      };

      startCall(assistantConfig);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-100 mx-auto mb-4" />
          <p className="text-light-100">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-primary-100 mb-2">
          Interview Not Found
        </h2>
        <p className="text-light-100 mb-6">
          The interview you're looking for doesn't exist.
        </p>
        <Link href="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (isEnding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-100 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-100 mb-2">
            Processing Interview
          </h3>
          <p className="text-light-100">
            Analyzing your responses and generating feedback...
          </p>
        </div>
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
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Mock Interview</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-100">
            {isCallActive ? "Interview in Progress" : "Mock Interview"}
          </h1>
          <p className="text-light-100 mt-2">
            {formatDate(interview.createdAt)}
          </p>
        </div>
      </div>

      <div className="call-view">
        {/* Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            {isCallActive && (
              <div className="animate-speak"></div>
            )}
            <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center">
              <span className="text-dark-100 font-bold text-xl">AI</span>
            </div>
          </div>
          <h3 className="text-primary-100 font-semibold">
            AI Interview Coach
          </h3>
          <p className="text-light-100 text-center text-sm">
            {isCallActive 
              ? "Listening to your responses..." 
              : "Ready to conduct your mock interview"
            }
          </p>
          
          {/* Interview Questions Preview */}
          {!isCallActive && interview.questions && (
            <div className="mt-4 p-4 bg-dark-200 rounded-lg">
              <h4 className="text-sm font-medium text-primary-100 mb-2">
                Questions to be asked:
              </h4>
              <ul className="text-xs text-light-100 space-y-1">
                {interview.questions.slice(0, 3).map((question, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-100">{index + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
                {interview.questions.length > 3 && (
                  <li className="text-primary-100">
                    +{interview.questions.length - 3} more questions...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="card-border">
          <div className="card-content">
            <div className="flex flex-col items-center gap-6">
              {/* Call Status */}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isCallActive ? 'bg-success-100' : 'bg-primary-200'
                }`}>
                  {isCallActive ? (
                    <PhoneOff className="w-8 h-8 text-white" />
                  ) : (
                    <Phone className="w-8 h-8 text-dark-100" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-primary-100 mb-2">
                  {isCallActive ? "Interview Active" : "Ready to Start"}
                </h3>
                <p className="text-light-100 text-sm">
                  {isCallActive 
                    ? "Your mock interview is in progress" 
                    : "Click start to begin your interview"
                  }
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4 w-full">
                {!isCallActive ? (
                  <button
                    onClick={handleStartInterview}
                    className="btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                  >
                    <Phone className="w-5 h-5" />
                    Start Interview
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={toggleCall}
                      className="w-full btn-disconnect flex items-center justify-center gap-2 py-3"
                    >
                      <PhoneOff className="w-5 h-5" />
                      End Interview
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={isMuted ? unmute : mute}
                        className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                          isMuted 
                            ? 'bg-destructive-100/20 text-destructive-100' 
                            : 'bg-dark-200 text-light-100'
                        }`}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isMuted ? 'Unmute' : 'Mute'}
                      </button>
                      
                      <button
                        onClick={isDeafened ? undeafen : deafen}
                        className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                          isDeafened 
                            ? 'bg-destructive-100/20 text-destructive-100' 
                            : 'bg-dark-200 text-light-100'
                        }`}
                      >
                        {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {isDeafened ? 'Unmute AI' : 'Mute AI'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-light-100">
                <p className="mb-2">
                  {isCallActive 
                    ? "Speak naturally and answer the questions to the best of your ability."
                    : "Make sure you're in a quiet environment with a good internet connection."
                  }
                </p>
                {!isCallActive && (
                  <p>
                    The interview will be recorded for feedback analysis.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}