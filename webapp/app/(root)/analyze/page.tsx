"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, FileText, Briefcase, Github, Linkedin, Loader2, Check, Mic, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AnalysisProgress from "@/components/dashboard/AnalysisProgress";
import { auth } from "@/lib/firebase/client";

const analysisSchema = z.object({
  resume_text: z.string().min(100, "Resume must be at least 100 characters"),
  job_description: z.string().min(50, "Job description must be at least 50 characters"),
  github_url: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
});

type AnalysisFormData = z.infer<typeof analysisSchema>;

const steps = [
  { id: 1, name: "Resume", icon: FileText },
  { id: 2, name: "Job Description", icon: Briefcase },
  { id: 3, name: "Social Profiles", icon: Github },
];

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisStage, setAnalysisStage] = useState<"resume" | "job" | "social" | "synthesis" | "complete">("resume");
  const [showProgress, setShowProgress] = useState(false);
  const router = useRouter();

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      resume_text: "",
      job_description: "",
      github_url: "",
      linkedin_url: "",
    },
  });

  const onSubmit = async (data: AnalysisFormData) => {
    setIsLoading(true);
    setShowProgress(true);
    
    // Simulate progress stages while waiting for backend
    const progressSimulation = setInterval(() => {
      setAnalysisStage(current => {
        if (current === "resume") return "job";
        if (current === "job") return "social";
        if (current === "social") return "synthesis";
        return current;
      });
    }, 30000); // Update every 30 seconds
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be signed in to create an analysis");
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          resume: data.resume_text,
          jobDesc: data.job_description,
          github: data.github_url || undefined,
          linkedin: data.linkedin_url || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create analysis");
      }

      clearInterval(progressSimulation);
      setAnalysisStage("complete");
      toast.success("Analysis created successfully!");
      router.push(`/report/${result.analysisId}`);
    } catch (error) {
      clearInterval(progressSimulation);
      console.error("Error creating analysis:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create analysis");
      setShowProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAnalysis = () => {
    setIsLoading(false);
    setShowProgress(false);
    setAnalysisStage("resume");
    toast.info("Analysis cancelled");
  };

  return (
    <>
      {/* Progress Modal */}
      <AnalysisProgress
        isOpen={showProgress}
        currentStage={analysisStage}
        onCancel={handleCancelAnalysis}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left: Analysis Form (3/4) */}
      <div className="lg:col-span-3 max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Career Analysis</h1>
            <p className="text-zinc-400 text-lg">
              Get personalized insights about your career fit and interview preparation.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      currentStep > step.id
                        ? "border-white bg-white"
                        : currentStep === step.id
                        ? "border-white bg-white/10"
                        : "border-white/30 bg-transparent"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5 text-black" />
                    ) : (
                      <step.icon
                        className={`w-5 h-5 ${
                          currentStep === step.id ? "text-white" : "text-zinc-600"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      currentStep >= step.id ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-white/10 mx-4" />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Resume Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Resume</h3>
                  <p className="text-zinc-400 text-sm">
                    Paste your resume text for comprehensive analysis
                  </p>
                </div>
              </div>
              
              <textarea
                {...form.register("resume_text")}
                className="w-full min-h-[200px] p-4 bg-black/50 rounded-xl text-white placeholder:text-zinc-600 border border-white/10 focus:border-white/30 focus:outline-none resize-vertical font-mono text-sm"
                placeholder="Paste your resume text here. Include your experience, skills, education, and projects..."
                disabled={isLoading}
                onFocus={() => setCurrentStep(1)}
              />
              {form.formState.errors.resume_text && (
                <p className="text-sm text-red-400 mt-2">
                  {form.formState.errors.resume_text.message}
                </p>
              )}
            </motion.div>

            {/* Job Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Job Description</h3>
                  <p className="text-zinc-400 text-sm">
                    The job you're applying for or interested in
                  </p>
                </div>
              </div>
              
              <textarea
                {...form.register("job_description")}
                className="w-full min-h-[150px] p-4 bg-black/50 rounded-xl text-white placeholder:text-zinc-600 border border-white/10 focus:border-white/30 focus:outline-none resize-vertical font-mono text-sm"
                placeholder="Paste the job description here. Include requirements, responsibilities, and company information..."
                disabled={isLoading}
                onFocus={() => setCurrentStep(2)}
              />
              {form.formState.errors.job_description && (
                <p className="text-sm text-red-400 mt-2">
                  {form.formState.errors.job_description.message}
                </p>
              )}
            </motion.div>

            {/* Social Profiles Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Social Profiles</h3>
                  <p className="text-zinc-400 text-sm">
                    Optional: Add your GitHub and LinkedIn for enhanced analysis
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">GitHub URL</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...form.register("github_url")}
                      type="url"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 rounded-xl text-white placeholder:text-zinc-600 border border-white/10 focus:border-white/30 focus:outline-none"
                      placeholder="https://github.com/username"
                      disabled={isLoading}
                      onFocus={() => setCurrentStep(3)}
                    />
                  </div>
                  {form.formState.errors.github_url && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.github_url.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      {...form.register("linkedin_url")}
                      type="url"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 rounded-xl text-white placeholder:text-zinc-600 border border-white/10 focus:border-white/30 focus:outline-none"
                      placeholder="https://linkedin.com/in/username"
                      disabled={isLoading}
                      onFocus={() => setCurrentStep(3)}
                    />
                  </div>
                  {form.formState.errors.linkedin_url && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.linkedin_url.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="submit"
                className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Start Analysis
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </div>

      {/* Right: Interview Pitch Sidebar (1/4) */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          {/* Interview CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Ready to Practice?</h3>
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Complete your analysis to unlock AI-powered mock interviews with real-time feedback.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-400">Real-time voice interaction</p>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-400">Personalized questions</p>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-400">Instant performance reports</p>
                </div>
              </div>

              <button
                disabled
                className="w-full py-3 rounded-xl bg-white/10 text-zinc-500 text-sm font-bold border border-white/10 cursor-not-allowed"
              >
                Complete Analysis First
              </button>
            </div>
          </motion.div>

          {/* Tip Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pro Tip</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Be specific about your skills and experience. The more detailed your resume, the better your analysis and interview questions.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
