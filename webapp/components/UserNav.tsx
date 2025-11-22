"use client";

import { useState } from "react";
import Link from "next/link";
// import { User } from "@/types/index";
import { auth } from "@/lib/firebase/client";
import { signOut } from "@/lib/actions/auth.action";
import { LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";

export default function UserNav({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await signOut();
      window.location.href = "/"; // Redirect to landing page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/5 bg-card p-2 shadow-lg backdrop-blur-sm animate-fadeIn">
          <div className="p-2">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <div className="h-px bg-border my-2" />
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <UserIcon className="h-4 w-4" />
            My Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <div className="h-px bg-border my-2" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive-100 hover:bg-destructive-100/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}