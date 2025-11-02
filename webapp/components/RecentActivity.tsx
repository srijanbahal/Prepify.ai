import { FileText, MessageSquare, CheckCircle, Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "analysis",
    title: "Completed Career Analysis",
    description: "Frontend Developer position at Tech Corp",
    time: "2 hours ago",
    icon: FileText,
    iconColor: "bg-blue-500/10 text-blue-400",
  },
  {
    id: 2,
    type: "interview",
    title: "Mock Interview Session",
    description: "Scored 85% on technical questions",
    time: "5 hours ago",
    icon: MessageSquare,
    iconColor: "bg-purple-500/10 text-purple-400",
  },
  {
    id: 3,
    type: "completed",
    title: "Skill Gap Resolved",
    description: "Completed React.js advanced course",
    time: "1 day ago",
    icon: CheckCircle,
    iconColor: "bg-emerald-500/10 text-emerald-400",
  },
  {
    id: 4,
    type: "pending",
    title: "Upcoming Interview",
    description: "Senior Developer role preparation",
    time: "Tomorrow",
    icon: Clock,
    iconColor: "bg-amber-500/10 text-amber-400",
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 group cursor-pointer rounded-lg p-3 hover:bg-white/5 transition-all"
          >
            <div className={`rounded-lg ${activity.iconColor} p-2.5 transition-transform group-hover:scale-110`}>
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                {activity.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
        View All Activity
      </button>
    </div>
  );
}
