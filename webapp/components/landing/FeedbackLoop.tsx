"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export default function FeedbackLoop() {
  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Visual Side (Left on desktop for variety) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1 relative"
        >
          <div className="relative rounded-3xl bg-[#0A0A0A] border border-white/10 p-8 space-y-8">
            {/* Match Score */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-400 text-sm font-mono uppercase">Match Score</h3>
                <div className="text-5xl font-bold text-white mt-2">88%</div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-mono uppercase">Skill Analysis</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> React System Design
                </span>
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm border border-red-500/20 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> AWS Architecture
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> TypeScript
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Side */}
        <div className="order-1 lg:order-2 space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            The Feedback Loop.
            <br />
            <span className="text-gray-500">Data-Driven Growth.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            Get detailed analytics after every session. Identify skill gaps,
            track your progress, and receive actionable recommendations to
            improve your interview performance.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
