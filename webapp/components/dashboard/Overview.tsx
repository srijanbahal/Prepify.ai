"use client";

import { motion } from "framer-motion";
import StatsCards from "./StatsCards";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";

interface DashboardOverviewProps {
  user: any;
  analyses: any[];
}

export default function DashboardOverview({ user, analyses }: DashboardOverviewProps) {
  // Calculate stats from real data or use defaults
  const stats = {
    totalAnalyses: analyses.length,
    totalInterviews: 0, // Placeholder until interviews API is connected
    avgScore: analyses.length > 0 
      ? Math.round(analyses.reduce((acc, curr) => acc + (curr.match_score || 0), 0) / analyses.length) 
      : 0,
    practiceHours: 0, // Placeholder
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-zinc-400">
            Here's what's happening with your career preparation.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm text-zinc-500 font-mono">
            {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <StatsCards stats={stats} />
      
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity analyses={analyses} />
        </div>
        
        <div className="space-y-8">
          {/* Sidebar Widget: AI Insight */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">AI Insight</h3>
            <p className="text-sm text-zinc-300 mb-4 relative z-10 leading-relaxed">
              "Your resume shows strong technical skills, but your interview responses could be more concise. Try the STAR method in your next mock interview."
            </p>
            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider">
              View Full Report
            </button>
          </div>

          {/* Sidebar Widget: Daily Tip */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Daily Tip</h3>
            <p className="text-sm text-white leading-relaxed">
              Research the company's core values before your interview. Aligning your answers with their culture can increase your chances by 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
