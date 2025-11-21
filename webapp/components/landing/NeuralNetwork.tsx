"use client";

import { motion } from "framer-motion";
import { FileText, Briefcase, Share2, BrainCircuit } from "lucide-react";

const agents = [
  {
    title: "Resume Agent",
    description: "Deep parsing of skills, experience, and achievements.",
    icon: FileText,
    delay: 0.1,
  },
  {
    title: "Job Decoder",
    description: "Analyzes company culture and core requirements.",
    icon: Briefcase,
    delay: 0.2,
  },
  {
    title: "Social Analyzer",
    description: "Extracts insights from GitHub and LinkedIn profiles.",
    icon: Share2,
    delay: 0.3,
  },
  {
    title: "Synthesis Engine",
    description: "Generates the final match score and strategy.",
    icon: BrainCircuit,
    delay: 0.4,
  },
];

export default function NeuralNetwork() {
  return (
    <section id="features" className="py-24 px-4 bg-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            The Neural Network
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Powered by CrewAI, our multi-agent system works in parallel to
            deconstruct every aspect of your career profile.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: agent.delay }}
              whileHover={{ scale: 1.02 }}
              className="group relative p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <agent.icon className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {agent.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
