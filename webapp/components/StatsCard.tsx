import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconBgColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconBgColor
}: StatsCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-gray-400"
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 backdrop-blur-sm hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-medium ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`rounded-lg ${iconBgColor} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </div>
  );
}
