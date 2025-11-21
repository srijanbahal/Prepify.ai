"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react"; // Import icons

// This Navbar is now only for the logged-out state (e.g., Landing Page)
// The `user` prop is no longer needed.
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between p-6 bg-card/50 backdrop-blur-sm border-b border-border">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Prepify
        </span>
      </Link>

      {/* LOGGED-OUT STATE */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Sign Up
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile menu (conditionally render content) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg py-4">
          <div className="flex flex-col gap-4 px-6">
            <Link
              href="/sign-in"
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <Sparkles className="h-4 w-4" />
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}