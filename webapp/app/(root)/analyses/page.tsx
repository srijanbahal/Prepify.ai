"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  Briefcase, 
  Building2, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/dashboard/Navbar";

interface Analysis {
  id: string;
  job_title: string;
  company: string;
  match_score: number;
  created_at: string;
  status: string;
}

export default function AnalysesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, high_match, recent

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      setUser({
        id: currentUser.uid,
        name: currentUser.displayName || "User",
        email: currentUser.email,
        image: currentUser.photoURL,
      });

      try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyses`, {
          headers: {
            "Authorization": `Bearer ${idToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch analyses");

        const data = await response.json();
        setAnalyses(data);
        setFilteredAnalyses(data);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let result = analyses;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.job_title?.toLowerCase().includes(query) ||
          a.company?.toLowerCase().includes(query)
      );
    }

    // Filter
    if (filter === "high_match") {
      result = result.filter((a) => (a.match_score || 0) >= 80);
    }

    setFilteredAnalyses(result);
  }, [searchQuery, filter, analyses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-noir-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <Navbar user={user} />

      <main className="relative pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 text-glow">My Analyses</h1>
            <p className="text-zinc-400">Track and manage your job applications and insights.</p>
          </div>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
          >
            <Briefcase className="w-5 h-5" />
            New Analysis
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                filter === "all"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("high_match")}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                filter === "high_match"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
              }`}
            >
              High Match
            </button>
          </div>
        </div>

        {/* Analyses Grid */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAnalyses.length > 0 ? (
              filteredAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/report/${analysis.id}`}
                    className="group block p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    <div className="flex items-center gap-6 relative z-10">
                      {/* Score Circle */}
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl font-bold text-blue-400">
                          {Math.round(analysis.match_score || 0)}%
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {analysis.job_title || "Untitled Position"}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 font-medium">
                            {analysis.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {analysis.company || "Unknown Company"}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {analysis.created_at ? formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true }) : "Unknown date"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-500 group-hover:text-white transition-colors">
                        <span className="text-sm font-medium hidden md:block">View Report</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No analyses found</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  We couldn't find any analyses matching your criteria. Try adjusting your filters or create a new one.
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  Create New Analysis
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
