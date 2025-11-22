"use client";

import { motion } from "framer-motion";
import { FileText, Mic, Target, TrendingUp } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon?: any;
}

interface StatsCardsProps {
  stats: StatItem[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const icons = [FileText, Target, Mic, TrendingUp];

  const items = stats.map((stat, index) => ({
    ...stat,
    icon: icons[index] || FileText,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-2xl noir-card hover:border-white/20 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            {item.trend === "up" && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                {item.change}
              </span>
            )}
            {item.trend === "neutral" && (
              <span className="text-xs font-medium text-zinc-400 bg-zinc-400/10 px-2 py-1 rounded-full border border-zinc-400/20">
                {item.change}
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1 font-sans text-glow">{item.value}</h3>
          <p className="text-sm text-zinc-500">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
