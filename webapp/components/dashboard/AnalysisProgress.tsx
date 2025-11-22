"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, X } from "lucide-react";

interface AnalysisProgressProps {
  isOpen: boolean;
  currentStage: "resume" | "job" | "social" | "synthesis" | "complete";
  onCancel: () => void;
}

const stages = [
  { id: "resume", label: "Analyzing Resume", estimatedTime: 30 },
  { id: "job", label: "Analyzing Job Description", estimatedTime: 25 },
  { id: "social", label: "Analyzing Social Profiles", estimatedTime: 20 },
  { id: "synthesis", label: "Synthesizing Results", estimatedTime: 25 },
];

export default function AnalysisProgress({ isOpen, currentStage, onCancel }: AnalysisProgressProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);
  const totalEstimatedTime = stages.reduce((sum, s) => sum + s.estimatedTime, 0);
  const elapsedTime = stages.slice(0, currentIndex).reduce((sum, s) => sum + s.estimatedTime, 0);
  const remainingTime = totalEstimatedTime - elapsedTime;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md p-8 rounded-3xl bg-black border border-white/10 relative">
              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Profile</h2>
                <p className="text-zinc-400">
                  Estimated time remaining: ~{remainingTime} seconds
                </p>
              </div>

              {/* Progress Stages */}
              <div className="space-y-4 mb-8">
                {stages.map((stage, index) => {
                  const isComplete = index < currentIndex;
                  const isCurrent = stage.id === currentStage;
                  const isPending = index > currentIndex;

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        isCurrent ? "bg-blue-500/10 border border-blue-500/30" :
                        isComplete ? "bg-emerald-500/10 border border-emerald-500/30" :
                        "bg-white/5 border border-white/10"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCurrent ? "bg-blue-500/20" :
                        isComplete ? "bg-emerald-500/20" :
                        "bg-white/10"
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-zinc-600" />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isCurrent ? "text-blue-400" :
                          isComplete ? "text-emerald-400" :
                          "text-zinc-500"
                        }`}>
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-zinc-500 mt-1">
                            ~{stage.estimatedTime}s
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Progress</span>
                  <span>{Math.round((elapsedTime / totalEstimatedTime) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(elapsedTime / totalEstimatedTime) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Tip */}
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  💡 <strong>Did you know?</strong> Our AI analyzes your resume, job description, and social profiles to provide personalized interview preparation.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
