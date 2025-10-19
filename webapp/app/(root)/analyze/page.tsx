"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, FileText, Briefcase, Github, Linkedin, Loader2 } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";

const analysisSchema = z.object({
  resume_text: z.string().min(100, "Resume must be at least 100 characters"),
  job_description: z.string().min(50, "Job description must be at least 50 characters"),
  github_url: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
});

type AnalysisFormData = z.infer<typeof analysisSchema>;

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
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
    
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      toast.success("Analysis created successfully!");
      router.push(`/report/${result.analysisId}`);
    } catch (error) {
      console.error("Error creating analysis:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create analysis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-100 mb-4">
          Career Analysis
        </h1>
        <p className="text-light-100 text-lg">
          Get personalized insights about your career fit and interview preparation.
        </p>
      </div>

      <div className="card-border">
        <div className="card p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Resume Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-200/20 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-100">
                      Resume Analysis
                    </h3>
                    <p className="text-light-100 text-sm">
                      Paste your resume text for comprehensive analysis
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-light-100">
                    Resume Text *
                  </label>
                  <textarea
                    {...form.register("resume_text")}
                    className="w-full min-h-[200px] p-4 bg-dark-200 rounded-lg text-light-100 placeholder:text-light-100/50 border border-border focus:border-primary-100 focus:outline-none resize-vertical"
                    placeholder="Paste your resume text here. Include your experience, skills, education, and projects..."
                    disabled={isLoading}
                  />
                  {form.formState.errors.resume_text && (
                    <p className="text-sm text-destructive-100">
                      {form.formState.errors.resume_text.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-200/20 rounded-lg">
                    <Briefcase className="w-5 h-5 text-primary-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-100">
                      Job Description
                    </h3>
                    <p className="text-light-100 text-sm">
                      The job you're applying for or interested in
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-light-100">
                    Job Description *
                  </label>
                  <textarea
                    {...form.register("job_description")}
                    className="w-full min-h-[150px] p-4 bg-dark-200 rounded-lg text-light-100 placeholder:text-light-100/50 border border-border focus:border-primary-100 focus:outline-none resize-vertical"
                    placeholder="Paste the job description here. Include requirements, responsibilities, and company information..."
                    disabled={isLoading}
                  />
                  {form.formState.errors.job_description && (
                    <p className="text-sm text-destructive-100">
                      {form.formState.errors.job_description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Profiles Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-200/20 rounded-lg">
                    <Github className="w-5 h-5 text-primary-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-100">
                      Social Profiles
                    </h3>
                    <p className="text-light-100 text-sm">
                      Optional: Add your GitHub and LinkedIn profiles for enhanced analysis
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-light-100">
                      GitHub URL
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-100/50" />
                      <input
                        {...form.register("github_url")}
                        type="url"
                        className="w-full pl-10 pr-4 py-3 bg-dark-200 rounded-lg text-light-100 placeholder:text-light-100/50 border border-border focus:border-primary-100 focus:outline-none"
                        placeholder="https://github.com/username"
                        disabled={isLoading}
                      />
                    </div>
                    {form.formState.errors.github_url && (
                      <p className="text-sm text-destructive-100">
                        {form.formState.errors.github_url.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-light-100">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-100/50" />
                      <input
                        {...form.register("linkedin_url")}
                        type="url"
                        className="w-full pl-10 pr-4 py-3 bg-dark-200 rounded-lg text-light-100 placeholder:text-light-100/50 border border-border focus:border-primary-100 focus:outline-none"
                        placeholder="https://linkedin.com/in/username"
                        disabled={isLoading}
                      />
                    </div>
                    {form.formState.errors.linkedin_url && (
                      <p className="text-sm text-destructive-100">
                        {form.formState.errors.linkedin_url.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full btn-primary text-lg py-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
