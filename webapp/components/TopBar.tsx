import Link from "next/link";
import { Sparkles, BarChart3 } from "lucide-react";
// import { User } from "@/constants/index";
import UserNav from "./UserNav"; // Import the new dropdown

export default function TopBar({ user, title }: { user: User; title: string }) {
  return (
    <div className="border-b border-white/5 bg-[#0A0B0F]/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Welcome back, {user.name.split(" ")[0]}
          </p>
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </button>
          <Link
            href="/analyze"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            New Analysis
          </Link>

          {/* User Dropdown */}
          <UserNav user={user} />
        </div>
      </div>
    </div>
  );
}