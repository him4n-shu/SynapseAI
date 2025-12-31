import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/cards/StatCard";
import ActivityItem from "@/components/cards/ActivityItem";
import MiniChart from "@/components/charts/MiniChart";
import ProgressBar from "@/components/charts/ProgressBar";
import { useInterview } from "@/contexts/InterviewContext";
import { userAPI, scheduledAPI } from "@/services/api";
import { Target, BarChart3, CheckCircle, Clock, TrendingUp, Calendar, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getHistory } = useInterview();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allInterviews, setAllInterviews] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [passedCount, setPassedCount] = useState(0);
  const [needWorkCount, setNeedWorkCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [weekStats, setWeekStats] = useState({
    interviews: 0,
    avgScore: 0,
    timeSpent: 0,
    bestRole: "N/A"
  });
  const [scheduledInterviews, setScheduledInterviews] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadScheduledInterviews();
  }, []);

  const loadScheduledInterviews = async () => {
    try {
      const response = await scheduledAPI.getScheduled();
      if (response.success) {
        setScheduledInterviews(response.scheduledInterviews || []);
      }
    } catch (error) {
      console.error('Failed to load scheduled interviews:', error);
    }
  };

  const handleCancelScheduled = async (id) => {
    try {
      await scheduledAPI.cancel(id);
      toast.success('Scheduled interview cancelled');
      loadScheduledInterviews();
    } catch (error) {
      toast.error('Failed to cancel scheduled interview');
    }
  };

  const formatScheduledDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const history = await getHistory();
      setAllInterviews(history);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndUpdateData = () => {
    if (!allInterviews || allInterviews.length === 0) {
      setStats({
        totalInterviews: 0,
        averageScore: 0,
        completedToday: 0,
        totalPracticeTime: 0,
      });
      setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
      setMonthlyData(Array(12).fill(0));
      setSkillBreakdown([{ skill: "No data yet", score: 0, color: "lime" }]);
      setRecentActivity([]);
      setPassedCount(0);
      setNeedWorkCount(0);
      setInProgressCount(0);
      setWeekStats({
        interviews: 0,
        avgScore: 0,
        timeSpent: 0,
        bestRole: "N/A"
      });
      return;
    }
    
    let filteredInterviews = [...allInterviews];

    // Filter by role
    if (selectedRole !== "all") {
      filteredInterviews = filteredInterviews.filter(
        interview => interview.role === selectedRole
      );
    }

    // Filter by time range
    const now = new Date();
    if (selectedTimeRange !== "all") {
      filteredInterviews = filteredInterviews.filter(interview => {
        const interviewDate = new Date(interview.completedAt);
        const diffMs = now - interviewDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (selectedTimeRange === "today") return diffDays === 0;
        if (selectedTimeRange === "week") return diffDays <= 7;
        if (selectedTimeRange === "month") return diffDays <= 30;
        return true;
      });
    }

    // Recalculate stats with filtered data
    const totalInterviews = filteredInterviews.length;
    const avgScore = totalInterviews > 0
      ? Math.round(filteredInterviews.reduce((sum, i) => sum + (i.results?.overallScore || 0), 0) / totalInterviews)
      : 0;
    const completedToday = filteredInterviews.filter(i => {
      const date = new Date(i.completedAt);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;

    setStats({
      totalInterviews,
      averageScore: avgScore,
      completedToday,
      totalPracticeTime: filteredInterviews.reduce((sum, i) => sum + (i.duration || 0), 0),
    });

    // Recalculate weekly data
    const last7Days = Array(7).fill(0);
    const today = new Date();
    filteredInterviews.forEach(interview => {
      const interviewDate = new Date(interview.completedAt);
      const diffDays = Math.floor((today - interviewDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        last7Days[6 - diffDays] = interview.results?.overallScore || 0;
      }
    });
    setWeeklyData(last7Days);

    // Recalculate monthly data
    const last12Months = Array(12).fill(0);
    const monthCounts = Array(12).fill(0);
    filteredInterviews.forEach(interview => {
      const interviewDate = new Date(interview.completedAt);
      const monthDiff = (today.getFullYear() - interviewDate.getFullYear()) * 12 + 
                       (today.getMonth() - interviewDate.getMonth());
      if (monthDiff >= 0 && monthDiff < 12) {
        const index = 11 - monthDiff;
        last12Months[index] += interview.results?.overallScore || 0;
        monthCounts[index]++;
      }
    });
    const monthlyAverages = last12Months.map((sum, i) => 
      monthCounts[i] > 0 ? Math.round(sum / monthCounts[i]) : 0
    );
    setMonthlyData(monthlyAverages);

    // Recalculate skill breakdown
    const roleScores = {};
    const roleCounts = {};
    filteredInterviews.forEach(interview => {
      const role = interview.role;
      if (!roleScores[role]) {
        roleScores[role] = 0;
        roleCounts[role] = 0;
      }
      roleScores[role] += interview.results?.overallScore || 0;
      roleCounts[role]++;
    });

    const skills = Object.keys(roleScores).map((role, index) => {
      const colors = ['lime', 'purple', 'cyan', 'yellow', 'orange'];
      return {
        skill: role.charAt(0).toUpperCase() + role.slice(1),
        score: Math.round(roleScores[role] / roleCounts[role]),
        color: colors[index % colors.length],
      };
    }).slice(0, 4);

    setSkillBreakdown(skills.length > 0 ? skills : [
      { skill: "No data yet", score: 0, color: "lime" }
    ]);

    // Update recent activity
    const formattedActivity = filteredInterviews.slice(0, 4).map(interview => ({
      title: `${interview.role.charAt(0).toUpperCase() + interview.role.slice(1)} Interview`,
      subtitle: `${interview.answers?.length || 0} questions completed`,
      time: formatTimeAgo(interview.completedAt),
      status: "completed",
      score: interview.results?.overallScore || 0,
    }));

    setRecentActivity(formattedActivity);

    // Calculate Interview Stats (Passed, Need Work, In Progress)
    const passed = filteredInterviews.filter(i => i.results?.overallScore >= 70).length;
    const needWork = filteredInterviews.filter(i => i.results?.overallScore < 70 && i.status === 'completed').length;
    const inProgress = filteredInterviews.filter(i => i.status === 'in-progress').length;
    
    setPassedCount(passed);
    setNeedWorkCount(needWork);
    setInProgressCount(inProgress);

    // Calculate This Week Stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekInterviews = filteredInterviews.filter(interview => {
      const interviewDate = new Date(interview.completedAt);
      return interviewDate >= weekStart;
    });

    const weekAvgScore = weekInterviews.length > 0
      ? Math.round(weekInterviews.reduce((sum, i) => sum + (i.results?.overallScore || 0), 0) / weekInterviews.length)
      : 0;

    const weekTimeSpent = weekInterviews.reduce((sum, i) => sum + (i.duration || 0), 0);
    const weekTimeHours = (weekTimeSpent / 3600).toFixed(1);

    // Find best role this week
    const weekRoleScores = {};
    weekInterviews.forEach(interview => {
      if (!weekRoleScores[interview.role]) {
        weekRoleScores[interview.role] = { total: 0, count: 0 };
      }
      weekRoleScores[interview.role].total += interview.results?.overallScore || 0;
      weekRoleScores[interview.role].count++;
    });

    let bestRole = "N/A";
    let bestAvg = 0;
    Object.keys(weekRoleScores).forEach(role => {
      const avg = weekRoleScores[role].total / weekRoleScores[role].count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestRole = role.charAt(0).toUpperCase() + role.slice(1);
      }
    });

    setWeekStats({
      interviews: weekInterviews.length,
      avgScore: weekAvgScore,
      timeSpent: weekTimeHours,
      bestRole: bestRole
    });
  };

  useEffect(() => {
    filterAndUpdateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, selectedTimeRange, allInterviews]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <MainLayout
        title="Dashboard"
        subtitle="Welcome back! Here's your progress overview."
        showFilters
        onRoleChange={setSelectedRole}
        onTimeRangeChange={setSelectedTimeRange}
        selectedRole={selectedRole}
        selectedTimeRange={selectedTimeRange}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const totalInterviews = stats?.totalInterviews || 0;
  const averageScore = stats?.averageScore || 0;
  const completedToday = stats?.completedToday || 0;
  const practiceHours = Math.floor((stats?.totalPracticeTime || 0) / 3600);
  
  // Calculate trend for weekly performance
  const weeklyTrend = weeklyData.length >= 2 
    ? Math.round(((weeklyData[weeklyData.length - 1] - weeklyData[0]) / (weeklyData[0] || 1)) * 100)
    : 0;

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Welcome back! Here's your progress overview."
      showFilters
      onRoleChange={setSelectedRole}
      onTimeRangeChange={setSelectedTimeRange}
      selectedRole={selectedRole}
      selectedTimeRange={selectedTimeRange}
    >
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Interviews"
              value={totalInterviews.toString()}
              icon={Target}
              trend={completedToday > 0 ? { value: completedToday, isPositive: true } : undefined}
              color="lime"
            />
            <StatCard
              title="Average Score"
              value={`${averageScore}%`}
              icon={BarChart3}
              trend={averageScore >= 75 ? { value: 5, isPositive: true } : undefined}
              color="purple"
            />
            <StatCard
              title="Strong Answers"
              value={`${averageScore}%`}
              icon={CheckCircle}
              color="cyan"
            />
            <StatCard
              title="Practice Hours"
              value={`${practiceHours}h`}
              icon={Clock}
              trend={practiceHours > 0 ? { value: practiceHours, isPositive: true } : undefined}
              color="yellow"
            />
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <div className="neon-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-foreground">Weekly Performance</h3>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                {weeklyTrend !== 0 && (
                  <div className={`flex items-center gap-2 ${weeklyTrend > 0 ? 'text-neon-lime' : 'text-red-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${weeklyTrend < 0 ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-medium">{weeklyTrend > 0 ? '+' : ''}{weeklyTrend}%</span>
                  </div>
                )}
              </div>
              <MiniChart data={weeklyData} color="lime" height={120} />
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="neon-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-foreground">Monthly Trend</h3>
                  <p className="text-sm text-muted-foreground">Last 12 weeks</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <MiniChart data={monthlyData} color="purple" height={120} />
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="neon-card p-6">
            <h3 className="font-medium text-foreground mb-6">Skill Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {skillBreakdown.map((skill) => (
                <ProgressBar
                  key={skill.skill}
                  label={skill.skill}
                  value={skill.score}
                  color={skill.color}
                />
              ))}
            </div>
          </div>

          {/* Interview Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="neon-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-neon-lime" />
                <span className="text-sm text-muted-foreground">Passed</span>
              </div>
              <div className="text-3xl font-bold text-neon-lime">{passedCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalInterviews > 0 ? Math.round((passedCount / totalInterviews) * 100) : 0}% success rate
              </div>
            </div>
            <div className="neon-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-neon-yellow" />
                <span className="text-sm text-muted-foreground">Need Work</span>
              </div>
              <div className="text-3xl font-bold text-neon-yellow">{needWorkCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Improvement needed</div>
            </div>
            <div className="neon-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-neon-purple" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
              <div className="text-3xl font-bold text-neon-purple">{inProgressCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Currently active</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Activity */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="neon-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Recent Activity</h3>
              <button 
                onClick={() => navigate("/history")}
                className="text-xs text-primary hover:underline transition-colors"
              >
                View all
              </button>
            </div>
            <div className="space-y-1">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="neon-card p-4">
            <h3 className="font-medium text-foreground mb-4">This Week</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interviews</span>
                <span className="font-semibold text-foreground">{weekStats.interviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Score</span>
                <span className={`font-semibold ${weekStats.avgScore >= 70 ? 'text-neon-lime' : 'text-neon-yellow'}`}>
                  {weekStats.avgScore}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Spent</span>
                <span className="font-semibold text-foreground">{weekStats.timeSpent}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Best Role</span>
                <span className="font-semibold text-neon-purple">{weekStats.bestRole}</span>
              </div>
            </div>
          </div>

          {/* Scheduled */}
          <div className="neon-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Scheduled</h3>
              <button 
                onClick={() => navigate("/select-role")}
                className="text-xs text-primary hover:underline"
              >
                + Schedule
              </button>
            </div>
            <div className="space-y-3">
              {scheduledInterviews.length > 0 ? (
                scheduledInterviews.slice(0, 3).map((scheduled) => (
                  <div 
                    key={scheduled._id}
                    className="p-3 rounded-lg bg-muted/30 border border-border group hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {scheduled.role.charAt(0).toUpperCase() + scheduled.role.slice(1)} Interview
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatScheduledDate(scheduled.scheduledDate)}
                        </p>
                        {scheduled.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {scheduled.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCancelScheduled(scheduled._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                        title="Cancel"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No scheduled interviews</p>
                  <button 
                    onClick={() => navigate("/select-role")}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Schedule your first interview
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

