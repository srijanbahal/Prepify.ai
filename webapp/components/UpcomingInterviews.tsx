import { Calendar, Clock, Briefcase, ArrowRight } from "lucide-react";

const upcomingInterviews = [
  {
    id: 1,
    company: "Tech Innovations Inc",
    role: "Senior Frontend Developer",
    date: "Mar 15, 2025",
    time: "10:00 AM",
    type: "Technical",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    company: "Digital Solutions",
    role: "Full Stack Engineer",
    date: "Mar 18, 2025",
    time: "2:30 PM",
    type: "Behavioral",
    color: "from-purple-500 to-pink-500",
  },
];

export default function UpcomingInterviews() {
  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Upcoming Interviews</h3>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {upcomingInterviews.map((interview) => (
          <div
            key={interview.id}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 hover:border-white/20 transition-all duration-300 cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${interview.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-400">{interview.company}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {interview.role}
                  </h4>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {interview.type}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{interview.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{interview.time}</span>
                </div>
              </div>

              <button className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Prepare Now
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
        Schedule New Interview
      </button>
    </div>
  );
}
