"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { signOut } from "@/lib/actions/auth.action";

// Accept user as a prop
export default function Navbar({ user }: { user?: User | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await signOut();
      // Use window.location.href for a full reload to clear all server state
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-6 bg-card/50 backdrop-blur-sm border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/next.svg" alt="Prepify" height={32} width={32} />
        <span className="text-2xl font-bold text-primary-100">Prepify</span>
      </Link>

      {/* Show different controls based on user state */}
      {user ? (
        // LOGGED-IN STATE
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-light-100 hover:text-primary-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link href="/analyze" className="btn-primary">
            New Analysis
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-light-100 hover:text-primary-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                <span className="text-dark-100 font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <span>{user.name ? user.name.split(" ")[0] : "Account"}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-light-100 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // LOGGED-OUT STATE
        <div className="hidden md:flex items-center gap-4">
          <Link href="/sign-in" className="text-primary-100 hover:text-primary-200">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Sign Up
          </Link>
        </div>
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-light-100 hover:text-primary-100 transition-colors"
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
            {user ? (
              <>
                <Link
                  href="/"
                  className="text-light-100 hover:text-primary-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/analyze"
                  className="btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  New Analysis
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-light-100 hover:text-primary-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-light-100 hover:text-primary-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}