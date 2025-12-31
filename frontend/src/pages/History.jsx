import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useInterview } from "@/contexts/InterviewContext";
import { ChevronRight, TrendingUp, TrendingDown, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

const History = () => {
  const navigate = useNavigate();
  const { getHistory } = useInterview();
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await getHistory();
      setInterviewHistory(history);
    } catch (error) {
      console.error("Failed to load history:", error);
      toast.error("Failed to load interview history");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory =
    filter === "all"
      ? interviewHistory
      : interviewHistory.filter((item) => {
          if (filter === "passed") return item.score >= 75;
          if (filter === "needs-improvement") return item.score < 75;
          return true;
        });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <MainLayout title="Interview History" subtitle="Review your past interviews and track progress">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Interview History" subtitle="Review your past interviews and track progress">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Filter Tabs */}
        <div className="neon-card p-1 inline-flex rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({interviewHistory.length})
          </button>
          <button
            onClick={() => setFilter("passed")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              filter === "passed"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Passed ({interviewHistory.filter((i) => i.score >= 75).length})
          </button>
          <button
            onClick={() => setFilter("needs-improvement")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              filter === "needs-improvement"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Needs Improvement ({interviewHistory.filter((i) => i.score < 75).length})
          </button>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="neon-card p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === "all" ? "No Interviews Yet" : "No Interviews Found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === "all"
                ? "Start your first interview to see your history here"
                : `No interviews matching "${filter}" filter`}
            </p>
            {filter === "all" && (
              <Link to="/select-role">
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Start Interview
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((interview, index) => {
              const isPassed = interview.score >= 75;
              const statusColor = isPassed ? "lime" : "yellow";
              const statusText = isPassed ? "Passed" : "Needs Improvement";
              const trend = index > 0 && interview.score > filteredHistory[index - 1].score ? "up" : "down";

              return (
                <div
                  key={interview._id || interview.id}
                  onClick={() => {
                    // Store interview ID and navigate to results
                    localStorage.setItem('viewInterviewId', interview._id || interview.id);
                    navigate('/results');
                  }}
                  className="block cursor-pointer"
                >
                  <div className="neon-card p-6 hover:border-primary/50 transition-all group">
                    <div className="flex items-center justify-between">
                      {/* Left Section */}
                      <div className="flex items-center gap-6 flex-1">
                        {/* Score Badge */}
                        <div
                          className={`w-20 h-20 rounded-xl bg-neon-${statusColor}/10 border border-neon-${statusColor}/30 flex items-center justify-center flex-shrink-0`}
                        >
                          <div className="text-center">
                            <div className={`text-2xl font-bold text-neon-${statusColor}`}>
                              {interview.score}
                            </div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                        </div>

                        {/* Interview Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {interview.role}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium bg-neon-${statusColor}/10 text-neon-${statusColor}`}
                            >
                              {statusText}
                            </span>
                            {trend && (
                              <div className="flex items-center gap-1">
                                {trend === "up" ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>{formatDate(interview.completedAt || interview.date)}</span>
                            <span>•</span>
                            <span>{formatTime(interview.completedAt || interview.date)}</span>
                            <span>•</span>
                            <span>{interview.answers?.length || interview.questions || 0} questions</span>
                            <span>•</span>
                            <span>{formatDuration(interview.duration || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Arrow */}
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {interviewHistory.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="neon-card p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Interviews</div>
              <div className="text-3xl font-bold text-foreground">{interviewHistory.length}</div>
            </div>
            <div className="neon-card p-6">
              <div className="text-sm text-muted-foreground mb-1">Average Score</div>
              <div className="text-3xl font-bold text-foreground">
                {Math.round(
                  interviewHistory.reduce((sum, i) => sum + i.score, 0) / interviewHistory.length
                )}
              </div>
            </div>
            <div className="neon-card p-6">
              <div className="text-sm text-muted-foreground mb-1">Pass Rate</div>
              <div className="text-3xl font-bold text-foreground">
                {Math.round(
                  (interviewHistory.filter((i) => i.score >= 75).length / interviewHistory.length) *
                    100
                )}
                %
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default History;
