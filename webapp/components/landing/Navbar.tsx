"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-xl">P</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          Prepify.ai
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link
          href="#features"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Features
        </Link>
        <Link
          href="#pricing"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-white hover:text-gray-300 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-4 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
