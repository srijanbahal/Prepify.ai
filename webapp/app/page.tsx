import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/lib/firebase/admin";
import AnalysisCard from "@/components/AnalysisCard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import RecentActivity from "@/components/RecentActivity";
import SkillsProgress from "@/components/SkillsProgress";
import UpcomingInterviews from "@/components/UpcomingInterviews";
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function Dashboard({ user }: { user: User }) {
  const analysesRef = db
    .collection("analyses")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc");

  const snapshot = await analysesRef.get();

  const analyses = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate()
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString(),
    };
  }) as (Omit<Analysis, "createdAt"> & { createdAt: string })[];

  return (
    <div className="flex min-h-screen bg-[#050608]">
      <Sidebar user={user} />

      <main className="flex-1 ml-64">
        <div className="border-b border-white/5 bg-[#0A0B0F]/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user.name}</p>
            </div>
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
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Analyses"
              value={analyses.length}
              change="+12% from last month"
              trend="up"
              icon={TrendingUp}
              iconBgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              title="Avg Match Score"
              value="78%"
              change="+5% improvement"
              trend="up"
              icon={Target}
              iconBgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatsCard
              title="Mock Interviews"
              value="24"
              change="8 this week"
              trend="up"
              icon={Award}
              iconBgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <StatsCard
              title="Practice Hours"
              value="42h"
              change="+15h this month"
              trend="up"
              icon={Clock}
              iconBgColor="bg-gradient-to-br from-pink-500 to-pink-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/analyze"
              className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Start Analysis</h3>
                  <p className="text-sm text-gray-400">Analyze your profile against job requirements</p>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <button className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent p-6 hover:border-purple-500/30 transition-all duration-300 text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Mock Interview</h3>
                  <p className="text-sm text-gray-400">Practice with AI-powered interviewer</p>
                </div>
                <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 hover:border-emerald-500/30 transition-all duration-300 text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Track Progress</h3>
                  <p className="text-sm text-gray-400">View your improvement over time</p>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Analyses - Spans 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Analyses</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View All
                </button>
              </div>

              {analyses.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-12 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <Zap className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Get started by creating your first career analysis
                  </p>
                  <Link
                    href="/analyze"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Analysis
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyses.slice(0, 4).map((analysis) => (
                    <AnalysisCard key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              )}

              {/* Upcoming Interviews */}
              <UpcomingInterviews />
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              <RecentActivity />
              <SkillsProgress />
            </div>
          </div>

          {/* AI Insights Banner */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 p-8">
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5" />
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">AI Insights</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Your interview readiness has improved by 23%
                </h3>
                <p className="text-sm text-gray-400">
                  Based on your recent practice sessions and skill development, you're now better prepared for senior-level positions.
                </p>
              </div>
              <button className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
                View Details
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoggedOutLandingPage() {
  return (
    <div className="min-h-screen bg-[#050608] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">AI-Powered Career Intelligence</span>
          </div>

          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Practice Job Interviews
            </span>
            <br />
            <span className="text-white">with AI</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Prepify.ai analyzes your resume, job description, and social profiles to give you personalized mock interviews and career guidance.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/#features"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white hover:bg-white/10 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    return <LoggedOutLandingPage />;
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return <Dashboard user={userData} />;
}
