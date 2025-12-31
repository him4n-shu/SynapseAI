import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Users, Target, ArrowRight, Zap, Brain, TrendingUp, CheckCircle, Clock, Award } from "lucide-react";
import StatCard from "@/components/cards/StatCard";
import MiniChart from "@/components/charts/MiniChart";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useInterview } from "@/contexts/InterviewContext";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getHistory } = useInterview();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const chartData = [65, 72, 68, 80, 75, 82, 78, 85, 88, 92];

  // Fetch user stats if authenticated
  useEffect(() => {
    const fetchUserStats = async () => {
      if (isAuthenticated()) {
        try {
          const history = await getHistory();
          const completed = history.filter(i => i.status === 'completed');
          const avgScore = completed.length > 0
            ? Math.round(completed.reduce((sum, i) => sum + (i.results?.overallScore || 0), 0) / completed.length)
            : 0;
          
          setUserStats({
            totalInterviews: completed.length,
            averageScore: avgScore,
            inProgress: history.filter(i => i.status === 'in-progress').length,
          });
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
        }
      }
      setLoading(false);
    };

    fetchUserStats();
  }, [isAuthenticated, getHistory]);

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size="default" />
            <span className="font-semibold text-lg text-foreground">SynapseAI</span>
          </Link>
          {isAuthenticated() && (
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/select-role" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Practice
              </Link>
              <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
            </nav>
          )}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              // Show profile picture when logged in
              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <div 
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-lime to-neon-cyan flex items-center justify-center text-sm font-bold text-primary-foreground border-2 border-primary"
                  style={{ display: user?.avatar ? 'none' : 'flex' }}
                >
                  {getUserInitials(user?.name)}
                </div>
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {user?.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
            ) : (
              // Show login buttons when not logged in
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="neon-filled" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Zap className="w-4 h-4 text-neon-yellow" />
                <span className="text-sm text-muted-foreground">AI-Powered Interview Platform</span>
              </div>
              
              {isAuthenticated() ? (
                <>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="text-foreground">Welcome back,</span>
                    <br />
                    <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}!</span>
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-lg">
                    {userStats?.inProgress > 0 
                      ? `You have ${userStats.inProgress} interview${userStats.inProgress > 1 ? 's' : ''} in progress. Continue where you left off or start a new one.`
                      : "Ready to practice? Start a new interview or review your past performance."}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    {userStats?.inProgress > 0 ? (
                      <Button 
                        variant="neon-filled" 
                        size="xl" 
                        className="group"
                        onClick={() => navigate('/interview')}
                      >
                        Continue Interview
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Link to="/select-role">
                        <Button variant="neon-filled" size="xl" className="group">
                          Start New Interview
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                    <Link to="/dashboard">
                      <Button variant="outline" size="xl">
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="text-foreground">Master Your</span>
                    <br />
                    <span className="gradient-text">Interview Skills.</span>
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-lg">
                    Practice role-based interviews with AI-powered evaluation, real-time feedback, and detailed analytics to land your dream job.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link to="/signup">
                      <Button variant="neon-filled" size="xl" className="group">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="xl">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="neon-card p-6 space-y-6">
                {isAuthenticated() && userStats ? (
                  <>
                    {/* User Stats Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Your Progress</h3>
                        <p className="text-sm text-muted-foreground">Keep improving!</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-neon-lime animate-pulse" />
                        <span className="text-sm text-neon-lime">Active</span>
                      </div>
                    </div>

                    {/* User Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-neon-lime/10 border border-neon-lime/30">
                        <div className="text-3xl font-bold text-neon-lime mb-1">
                          {userStats.averageScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                        <div className="text-3xl font-bold text-neon-purple mb-1">
                          {userStats.totalInterviews}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                        <div className="text-3xl font-bold text-neon-cyan mb-1">
                          {userStats.inProgress}
                        </div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate('/select-role')}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                          <Play className="w-4 h-4 text-neon-lime mb-1" />
                          <p className="text-xs font-medium text-foreground">New Interview</p>
                        </button>
                        <button
                          onClick={() => navigate('/history')}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                          <Clock className="w-4 h-4 text-neon-purple mb-1" />
                          <p className="text-xs font-medium text-foreground">View History</p>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Preview Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
                        <p className="text-sm text-muted-foreground">Track your progress</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-neon-lime animate-pulse" />
                        <span className="text-sm text-neon-lime">Live</span>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <MiniChart data={chartData} color="lime" height={100} />
                    </div>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-lime">87%</div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-purple">24</div>
                        <div className="text-xs text-muted-foreground">Interviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-cyan">4</div>
                        <div className="text-xs text-muted-foreground">Roles</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-neon-lime/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-neon-purple/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Available Roles"
              value="15+"
              icon={Target}
              color="lime"
            />
            <StatCard
              title="Average Score"
              value="82%"
              icon={BarChart3}
              trend={{ value: 12, isPositive: true }}
              color="purple"
            />
            <StatCard
              title="Interviews Taken"
              value="50K+"
              icon={Users}
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose SynapseAI?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive interview preparation with AI-powered feedback and real-time evaluation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Evaluation",
                description: "Real-time analysis of clarity, confidence, and technical depth",
                color: "lime",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Track your progress with comprehensive performance metrics",
                color: "purple",
              },
              {
                icon: TrendingUp,
                title: "Personalized Feedback",
                description: "Get actionable insights to improve your interview skills",
                color: "cyan",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="neon-card p-6 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-neon-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-neon-${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          {isAuthenticated() ? (
            <>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Keep Practicing, Keep Improving
              </h2>
              <p className="text-muted-foreground mb-8">
                {userStats?.totalInterviews > 0 
                  ? `You've completed ${userStats.totalInterviews} interview${userStats.totalInterviews > 1 ? 's' : ''} with an average score of ${userStats.averageScore}%. Let's aim higher!`
                  : "Start your first interview and get personalized AI feedback to improve your skills."}
              </p>
              <Link to="/select-role">
                <Button variant="neon-filled" size="xl" className="group">
                  {userStats?.totalInterviews > 0 ? 'Start Another Interview' : 'Begin Your First Interview'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of users practicing with AI-powered mock interviews. Sign up free and start improving today.
              </p>
              <Link to="/signup">
                <Button variant="neon-filled" size="xl" className="group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <span className="text-sm text-muted-foreground">SynapseAI © 2026</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Connect to Your Career
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

