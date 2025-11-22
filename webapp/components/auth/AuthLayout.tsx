"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-black text-white overflow-hidden font-sans selection:bg-white/20">
      {/* Left Column: Visual Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full lg:w-1/2 h-64 lg:h-auto bg-zinc-900 overflow-hidden"
      >
        <Image
          src="/assets/auth/auth-visual.png"
          alt="Prepify AI"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Overlay for text readability if needed, but keeping it minimal */}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black" />
        
        {/* Branding Overlay */}
        <div className="absolute top-8 left-8 z-20">
           <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
              <span className="font-sans font-bold text-xl tracking-tight text-white">Prepify.ai</span>
           </Link>
        </div>

        <div className="absolute bottom-12 left-8 max-w-md p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
          <p className="font-mono text-xs text-blue-200 mb-2 tracking-wider uppercase">AI-Powered Career Intelligence</p>
          <p className="text-lg font-medium text-white/90 leading-relaxed">
            "Master the art of the interview with real-time feedback and personalized coaching."
          </p>
        </div>
      </motion.div>

      {/* Right Column: Command Interface */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-black to-black pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
