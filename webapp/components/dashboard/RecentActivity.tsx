"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, ChevronRight, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  analyses: any[];
}

export default function RecentActivity({ analyses }: RecentActivityProps) {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        <Link href="/analyses" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-2">
        {analyses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-white font-medium mb-1">No activity yet</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Start your first analysis to see insights here.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors"
            >
              Create Analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {analyses.slice(0, 5).map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/analysis/${analysis.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <span className="text-sm font-bold">{Math.round(analysis.match_score || 0)}%</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {analysis.job_title || "Software Engineer Analysis"}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                        {analysis.company || "Tech Company"}
                      </p>
                      <span className="text-zinc-700 text-[10px]">•</span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {analysis.createdAt ? formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true }) : "Just now"}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
