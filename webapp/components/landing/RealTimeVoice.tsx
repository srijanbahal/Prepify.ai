"use client";

import { motion } from "framer-motion";

export default function RealTimeVoice() {
  return (
    <section className="py-24 px-4 bg-[#030303] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Powered by Vapi
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            Real-time Voice.
            <br />
            <span className="text-gray-500">Zero Latency.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            Practice with an AI that interrupts, listens, and reacts just like a
            real interviewer. Experience 100% realism with our advanced voice
            engine.
          </motion.p>
        </div>

        {/* Audio Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative h-[400px] rounded-3xl bg-black border border-white/10 flex items-center justify-center overflow-hidden"
        >
          <div className="flex items-center gap-1 h-32">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: ["20%", "100%", "20%"],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                  repeatType: "mirror",
                }}
                className="w-2 bg-white rounded-full opacity-80"
                style={{
                  height: "20%",
                }}
              />
            ))}
          </div>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
        </motion.div>
      </div>
    </section>
  );
}
