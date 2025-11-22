"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Mic, Sparkles } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Link href="/analyze" className="group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="h-full p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-950/10 border border-blue-500/10 hover:border-blue-500/30 transition-all relative overflow-hidden shadow-lg shadow-blue-900/5"
        >
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all border border-blue-500/10">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 text-glow">New Analysis</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Upload your resume and job description to get AI-powered insights.
            </p>
            <div className="flex items-center text-sm font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
              Start Analysis <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </motion.div>
      </Link>

      <Link href="/interviews/new" className="group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="h-full p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-950/10 border border-purple-500/10 hover:border-purple-500/30 transition-all relative overflow-hidden shadow-lg shadow-purple-900/5"
        >
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all border border-purple-500/10">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 text-glow">Mock Interview</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Practice with our realistic AI voice interviewer.
            </p>
            <div className="flex items-center text-sm font-medium text-purple-400 group-hover:translate-x-1 transition-transform">
              Start Session <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </motion.div>
      </Link>

      <div className="group cursor-not-allowed opacity-60">
        <div className="h-full p-6 rounded-2xl noir-card relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-white/5">
            Coming Soon
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-zinc-500 border border-white/5">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-zinc-300 mb-2">Career Coach</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Personalized career path planning and skill gap analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
