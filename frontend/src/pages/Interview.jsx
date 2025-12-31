import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/charts/ProgressBar";
import { useInterview } from "@/contexts/InterviewContext";
import { toast } from "sonner";
import {
  Play,
  Clock,
  Mic,
  MicOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const Interview = () => {
  const navigate = useNavigate();
  const { 
    selectedRole, 
    experienceLevel, 
    currentQuestion,
    questionNumber,
    totalQuestions,
    estimatedTime,
    answers,
    currentInterviewId,
    submitAnswer,
    nextQuestion,
    completeInterview,
    isLoading,
  } = useInterview();

  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Check if interview is set up
  useEffect(() => {
    if (!selectedRole || !currentQuestion) {
      toast.error("Please start an interview first");
      navigate("/select-role");
      return;
    }
  }, [selectedRole, currentQuestion, navigate]);

  // Reset timer when question changes
  useEffect(() => {
    // Use the expectedDuration from the current question, or default to 120
    const duration = currentQuestion?.expectedDuration || 120;
    setTimeLeft(duration);
    setQuestionStartTime(Date.now());
    setAnswer("");
    setIsSubmitted(false);
    setEvaluation(null);
    setShowTimeWarning(false);
  }, [currentQuestion]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    // Show warning when 30 seconds left (or 20% of time remaining)
    const duration = currentQuestion?.expectedDuration || 120;
    const warningTime = Math.max(30, Math.floor(duration * 0.2));
    if (timeLeft === warningTime && !showTimeWarning) {
      setShowTimeWarning(true);
      toast.warning(`${warningTime} seconds remaining!`);
    }
    
    // Auto-submit if time runs out
    if (timeLeft === 0 && !isSubmitted) {
      if (answer.trim()) {
        toast.error("Time's up! Submitting your answer...");
        handleSubmitAnswer();
      } else {
        toast.error("Time's up! Moving to next question...");
        handleSkipQuestion();
      }
    }
  }, [timeLeft, isSubmitted, showTimeWarning, currentQuestion, answer]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer before submitting");
      return;
    }

    setIsSubmitted(true);

    // Calculate time spent on this question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Save answer and get evaluation from backend
    const result = await submitAnswer(answer, timeSpent);

    if (result.success) {
      setEvaluation(result.evaluation);
      toast.success("Answer submitted successfully!");
    } else {
      toast.error(result.error || "Failed to submit answer");
      setIsSubmitted(false);
    }
  };

  const handleNextQuestion = async () => {
    const result = await nextQuestion();
    
    if (result.isComplete) {
      // Interview is complete, navigate to results
      handleCompleteInterview();
    } else if (result.success) {
      // Successfully loaded next question
      toast.success("Loading next question...");
    } else {
      toast.error(result.error || "Failed to load next question");
    }
  };

  const handleSkipQuestion = async () => {
    // Submit empty answer
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    await submitAnswer("", timeSpent);
    
    // Move to next question
    handleNextQuestion();
  };

  const handleCompleteInterview = async () => {
    try {
      const result = await completeInterview();
      
      if (result && result.success && result.results) {
        toast.success("Interview completed! Viewing your results...");
        setTimeout(() => {
          navigate("/results");
        }, 1000);
      } else {
        toast.error(result?.error || "Failed to complete interview. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to complete interview: " + error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice recording started");
    } else {
      toast.info("Voice recording stopped");
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((questionNumber - 1) / totalQuestions) * 100;
  const isLastQuestion = questionNumber >= totalQuestions;

  // Experience level UI configuration
  const experienceLevelConfig = {
    0: { 
      label: "Fresher", 
      color: "neon-lime", 
      bgGradient: "from-lime-500/10 to-green-500/10",
      borderColor: "border-lime-500/30",
      badge: "🌱 Entry Level",
      description: "Focus on fundamentals"
    },
    1: { 
      label: "Junior (0-1 years)", 
      color: "neon-cyan", 
      bgGradient: "from-cyan-500/10 to-blue-500/10",
      borderColor: "border-cyan-500/30",
      badge: "💡 Junior Level",
      description: "Building practical skills"
    },
    2: { 
      label: "Mid-level (1-3 years)", 
      color: "neon-purple", 
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/30",
      badge: "⚡ Mid-Level",
      description: "Demonstrating expertise"
    },
    3: { 
      label: "Senior (3-5 years)", 
      color: "neon-yellow", 
      bgGradient: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/30",
      badge: "🎯 Senior Level",
      description: "Leadership & architecture"
    },
    4: { 
      label: "Expert (5+ years)", 
      color: "neon-orange", 
      bgGradient: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/30",
      badge: "🏆 Expert Level",
      description: "Mastery & innovation"
    },
  };

  const currentLevelConfig = experienceLevelConfig[experienceLevel] || experienceLevelConfig[1];

  // Difficulty badge styling
  const difficultyConfig = {
    easy: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", label: "Easy" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Medium" },
    hard: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Hard" },
  };

  const currentDifficulty = difficultyConfig[currentQuestion?.difficulty] || difficultyConfig.medium;

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/select-role")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Role Selection</span>
          </button>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg border ${currentLevelConfig.borderColor} bg-gradient-to-r ${currentLevelConfig.bgGradient}`}>
              <span className="text-sm font-semibold text-foreground">{currentLevelConfig.badge}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className={`text-lg font-mono ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : timeLeft <= 60 ? 'text-yellow-500' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                Question {questionNumber} of {totalQuestions}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${currentDifficulty.border} ${currentDifficulty.bg} ${currentDifficulty.color}`}>
                {currentDifficulty.label}
              </span>
            </div>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <ProgressBar progress={progress} />
          <p className="text-xs text-muted-foreground mt-2 italic">{currentLevelConfig.description}</p>
        </div>

        {/* Interview Info */}
        <div className={`neon-card p-6 mb-6 border-2 ${currentLevelConfig.borderColor} bg-gradient-to-br ${currentLevelConfig.bgGradient}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Role</p>
              <p className="text-xl font-bold text-foreground capitalize">{selectedRole}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Experience</p>
              <p className="text-xl font-bold text-foreground">
                {currentLevelConfig.label}
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Questions</p>
              <p className="text-xl font-bold text-foreground">
                {totalQuestions} total
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Duration</p>
              <p className="text-xl font-bold text-foreground">
                {estimatedTime ? `~${estimatedTime} min` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="neon-card p-8 mb-6 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentLevelConfig.bgGradient}`} />
          
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentLevelConfig.bgGradient} border-2 ${currentLevelConfig.borderColor} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl font-bold text-foreground">Q{questionNumber}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {currentQuestion.category && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30">
                    {currentQuestion.category}
                  </span>
                )}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${currentDifficulty.border} ${currentDifficulty.bg} ${currentDifficulty.color}`}>
                  {currentDifficulty.label} Level
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground leading-relaxed">
                {currentQuestion.text}
              </h3>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isSubmitted || isLoading}
                className="w-full min-h-[200px] p-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                {answer.length} characters
              </div>
            </div>

            {/* Voice Recording Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                disabled={isSubmitted || isLoading}
                className="flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice Input
                  </>
                )}
              </Button>
              {isRecording && (
                <span className="text-sm text-red-500 animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Recording...
                </span>
              )}
            </div>
          </div>

          {/* Evaluation Display */}
          {evaluation && (
            <div className={`mt-6 p-6 rounded-xl bg-gradient-to-br ${currentLevelConfig.bgGradient} border-2 ${currentLevelConfig.borderColor}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${evaluation.score >= 7 ? 'bg-green-500/20 border-green-500/50' : evaluation.score >= 5 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/20 border-red-500/50'} border-2 flex items-center justify-center flex-shrink-0`}>
                  {evaluation.score >= 7 ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-foreground">AI Evaluation</h4>
                    <div className={`px-4 py-2 rounded-lg font-bold text-lg ${evaluation.score >= 7 ? 'bg-green-500/20 text-green-400' : evaluation.score >= 5 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {evaluation.score}/10
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-4 leading-relaxed">{evaluation.feedback}</p>
                  
                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-green-400 mb-2">✓ Strengths:</p>
                      <ul className="space-y-1">
                        {evaluation.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {evaluation.improvements && evaluation.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-yellow-400 mb-2">→ Areas to Improve:</p>
                      <ul className="space-y-1">
                        {evaluation.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleSkipQuestion}
            disabled={isSubmitted || isLoading}
          >
            Skip Question
          </Button>

          <div className="flex items-center gap-4">
            {!isSubmitted ? (
              <Button
                variant="neon-filled"
                size="lg"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            ) : (
              <Button
                variant="neon-filled"
                size="lg"
                onClick={isLastQuestion ? handleCompleteInterview : handleNextQuestion}
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isLastQuestion ? (
                  "Complete Interview"
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Warning Message */}
        {timeLeft <= 30 && !isSubmitted && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-500">
              Time is running out! Please submit your answer soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
