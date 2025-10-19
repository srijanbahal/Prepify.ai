import Link from "next/link";
import { Calendar, TrendingUp, Eye } from "lucide-react";

// Update the props interface to expect createdAt as a string
interface AnalysisCardProps {
  analysis: Omit<Analysis, 'createdAt'> & { createdAt: string };
}

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  // Update the function to accept a string
  const formatDate = (dateString: string) => {
    // Create a new Date object from the string
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    return "text-destructive-100";
  };

  const getStatusBadge = (analysis: Analysis) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100/20 text-success-100">
        Analyzed
      </span>
    );
  };

  return (
    <div className="card-border">
      <div className="card p-6 hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-light-100">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(analysis.createdAt)}</span>
          </div>
          {getStatusBadge(analysis as Analysis)}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-100" />
            <span className="text-sm font-medium text-light-100">Match Score</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${getMatchColor(analysis.match_score)}`}>
              {Math.round(analysis.match_score)}%
            </span>
            <div className="flex-1">
              <div className="w-full bg-dark-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    analysis.match_score >= 80
                      ? "bg-success-100"
                      : analysis.match_score >= 60
                      ? "bg-yellow-400"
                      : "bg-destructive-100"
                  }`}
                  style={{ width: `${analysis.match_score}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {analysis.skill_gaps && analysis.skill_gaps.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-light-100 mb-2">
              Key Skill Gaps ({analysis.skill_gaps.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {analysis.skill_gaps.slice(0, 3).map((gap, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-destructive-100/20 text-destructive-100"
                >
                  {gap}
                </span>
              ))}
              {analysis.skill_gaps.length > 3 && (
                <span className="text-xs text-light-100">
                  +{analysis.skill_gaps.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link
            href={`/report/${analysis.id}`}
            className="btn-secondary text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Report
          </Link>
          
          {analysis.interview_focus_areas && analysis.interview_focus_areas.length > 0 && (
            <Link
              href={`/interview/${analysis.id}`}
              className="btn-primary text-sm"
            >
              Start Interview
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}