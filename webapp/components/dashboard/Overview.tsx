"use client";

import { motion } from "framer-motion";
import StatsCards from "./StatsCards";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";

interface DashboardOverviewProps {
  user: any;
  analyses: any[];
  stats?: {
    total_analyses: number;
    total_interviews: number;
    average_score: number;
  };
}

export default function DashboardOverview({ user, analyses, stats }: DashboardOverviewProps) {
  // Calculate stats if not provided (fallback)
  const calculatedStats = stats || {
    total_analyses: analyses.length,
    total_interviews: 0, 
    average_score: analyses.length > 0
      ? analyses.reduce((acc, curr) => acc + (curr.match_score || 0), 0) / analyses.length
      : 0
  };

  const displayStats = [
    {
      label: "Total Analyses",
      value: calculatedStats.total_analyses.toString(),
      change: "+2 this week",
      trend: "up" as const,
    },
    {
      label: "Average Score",
      value: `${Math.round(calculatedStats.average_score)}%`,
      change: "+5% vs last week",
      trend: "up" as const,
    },
    {
      label: "Interviews Completed",
      value: calculatedStats.total_interviews.toString(),
      change: "+1 this week",
      trend: "up" as const,
    },
    {
      label: "Skills Improved",
      value: "12",
      change: "+3 new skills",
      trend: "up" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow">
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

      <StatsCards stats={displayStats} />
      
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity analyses={analyses} />
        </div>
        
        <div className="space-y-8">
          {/* Sidebar Widget: AI Insight */}
          <div className="noir-card p-6 relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">AI Insight</h3>
            <p className="text-sm text-zinc-400 mb-4 relative z-10 leading-relaxed">
              "Your resume shows strong technical skills, but your interview responses could be more concise. Try the STAR method in your next mock interview."
            </p>
            <button className="text-xs font-bold text-white hover:text-zinc-300 uppercase tracking-wider transition-colors">
              View Full Report
            </button>
          </div>

          {/* Sidebar Widget: Daily Tip */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Daily Tip</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Research the company's core values before your interview. Aligning your answers with their culture can increase your chances by 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
