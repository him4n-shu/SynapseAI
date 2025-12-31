import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/charts/ProgressBar";
import MiniChart from "@/components/charts/MiniChart";
import { useInterview } from "@/contexts/InterviewContext";
import { toast } from "sonner";
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  Loader2,
} from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const { currentResults, currentInterviewId, getResults, clearSession } = useInterview();
  const [results, setResults] = useState(currentResults);
  const [isLoading, setIsLoading] = useState(!currentResults);

  useEffect(() => {
    const loadResults = async () => {
      // Check if we have results in context (from just completing interview)
      if (currentResults) {
        setResults(currentResults);
        setIsLoading(false);
        return;
      }

      // Check for interview ID in context or localStorage (from history page)
      const interviewId = currentInterviewId || localStorage.getItem('viewInterviewId');
      
      if (interviewId) {
        // Fetch results from backend
        setIsLoading(true);
        try {
          const result = await getResults(interviewId);
          
          if (result && result.success && result.results) {
            setResults(result.results);
            localStorage.removeItem('viewInterviewId');
          } else if (result && result.results) {
            // Sometimes success flag might be missing but results exist
            setResults(result.results);
            localStorage.removeItem('viewInterviewId');
          } else {
            toast.error(result?.error || "Failed to load results");
            setTimeout(() => navigate("/dashboard"), 2000);
          }
        } catch (error) {
          toast.error("Failed to load results: " + error.message);
          setTimeout(() => navigate("/dashboard"), 2000);
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("No interview results found");
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    };

    loadResults();
  }, [currentResults, currentInterviewId, getResults, navigate]);

  const handleNewInterview = () => {
    clearSession();
    navigate("/select-role");
  };

  if (isLoading) {
    return (
      <MainLayout title="Interview Results" subtitle="Loading your results...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!results) {
    return (
      <MainLayout title="Interview Results" subtitle="No results available">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
          <p className="text-muted-foreground">No interview results found</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  const overallScore = results.overallScore || 0;
  const status = overallScore >= 75 ? "Interview Ready" : "Needs Improvement";
  const statusColor = overallScore >= 75 ? "lime" : "yellow";

  // Generate performance data from answers
  const performanceData = results.answers?.map(a => a.evaluation?.score * 10 || 0) || [];

  const strengths = results.strengths || [];
  const weakAreas = results.weakAreas || [];
  const improvements = results.improvements || [];

  const questionResults = results.answers?.map((answer, index) => ({
    question: answer.question || `Question ${index + 1}`,
    score: (answer.evaluation?.score || 0) * 10,
  })) || [];

  return (
    <MainLayout 
      title="Interview Results" 
      subtitle={`${results.role || 'Interview'} • ${new Date(results.completedAt || Date.now()).toLocaleDateString()}`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Section - Score & Status */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <div className="lg:col-span-2 neon-card p-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Score Circle */}
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={`hsl(var(--neon-${statusColor}))`}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallScore / 100) * 440} 440`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{overallScore}</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {status}
                </h2>
                <p className="text-muted-foreground mb-4">
                  You've completed {questionResults.length} questions with an average score of {overallScore}%
                </p>
                <div className="flex items-center gap-2">
                  {overallScore >= 75 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-neon-lime" />
                      <span className="text-neon-lime font-medium">Ready for real interviews!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-neon-yellow" />
                      <span className="text-neon-yellow font-medium">Keep practicing!</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleNewInterview}>
                <RefreshCw className="w-4 h-4 mr-2" />
                New Interview
              </Button>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="neon-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Performance Trend</h3>
            </div>
            <MiniChart data={performanceData} />
            <p className="text-sm text-muted-foreground mt-4">
              Your performance improved throughout the interview
            </p>
          </div>
        </div>

        {/* Strengths, Weak Areas, Improvements */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="neon-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-neon-lime" />
              <h3 className="font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-lime mt-1.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No strengths identified yet</li>
              )}
            </ul>
          </div>

          {/* Weak Areas */}
          <div className="neon-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-neon-yellow" />
              <h3 className="font-semibold text-foreground">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {weakAreas.length > 0 ? (
                weakAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow mt-1.5 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No weak areas identified</li>
              )}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="neon-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-semibold text-foreground">Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {improvements.length > 0 ? (
                improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-1.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No recommendations available</li>
              )}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="neon-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Question Breakdown</h3>
          </div>

          <div className="space-y-4">
            {questionResults.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {item.question}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {item.score}%
                  </span>
                </div>
                <ProgressBar progress={item.score} />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link to="/history">
            <Button variant="outline" size="lg">
              View History
            </Button>
          </Link>
          <Button variant="neon-filled" size="lg" onClick={handleNewInterview}>
            Start New Interview
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Results;
