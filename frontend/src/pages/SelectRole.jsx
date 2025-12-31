import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Code, Server, Users, Brain, ArrowRight, Check, Calendar } from "lucide-react";
import { useInterview } from "@/contexts/InterviewContext";
import { scheduledAPI } from "@/services/api";
import { toast } from "sonner";

const roles = [
  {
    id: "frontend",
    title: "Frontend Engineer",
    description: "React, JavaScript, CSS, UI/UX fundamentals",
    icon: Code,
    color: "lime",
    questions: 10,
  },
  {
    id: "backend",
    title: "Backend Engineer",
    description: "APIs, databases, system design, scalability",
    icon: Server,
    color: "purple",
    questions: 10,
  },
  {
    id: "hr",
    title: "HR Interview",
    description: "Behavioral, situational, cultural fit questions",
    icon: Users,
    color: "cyan",
    questions: 8,
  },
  {
    id: "aiml",
    title: "AI / ML Engineer",
    description: "Machine learning, data science, neural networks",
    icon: Brain,
    color: "yellow",
    questions: 10,
  },
];

const experienceLevels = [
  { 
    value: 0, 
    label: "Fresher", 
    badge: "🌱 Entry",
    questions: 8,
    time: 24,
    description: "Fundamental concepts and basic problem-solving",
    color: "lime"
  },
  { 
    value: 1, 
    label: "Junior (0-1 years)", 
    badge: "💡 Junior",
    questions: 10,
    time: 30,
    description: "Practical implementation and core skills",
    color: "cyan"
  },
  { 
    value: 2, 
    label: "Mid-level (1-3 years)", 
    badge: "⚡ Mid-Level",
    questions: 10,
    time: 40,
    description: "Advanced concepts and best practices",
    color: "purple"
  },
  { 
    value: 3, 
    label: "Senior (3-5 years)", 
    badge: "🎯 Senior",
    questions: 12,
    time: 60,
    description: "System design and leadership skills",
    color: "yellow"
  },
  { 
    value: 4, 
    label: "Expert (5+ years)", 
    badge: "🏆 Expert",
    questions: 15,
    time: 75,
    description: "Architecture mastery and innovation",
    color: "orange"
  },
];

const colorClasses = {
  lime: {
    bg: "bg-neon-lime/10",
    border: "border-neon-lime",
    text: "text-neon-lime",
    glow: "shadow-[0_0_20px_hsl(var(--neon-lime)/0.3)]",
  },
  purple: {
    bg: "bg-neon-purple/10",
    border: "border-neon-purple",
    text: "text-neon-purple",
    glow: "shadow-[0_0_20px_hsl(var(--neon-purple)/0.3)]",
  },
  cyan: {
    bg: "bg-neon-cyan/10",
    border: "border-neon-cyan",
    text: "text-neon-cyan",
    glow: "shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]",
  },
  yellow: {
    bg: "bg-neon-yellow/10",
    border: "border-neon-yellow",
    text: "text-neon-yellow",
    glow: "shadow-[0_0_20px_hsl(var(--neon-yellow)/0.3)]",
  },
};

const SelectRole = () => {
  const navigate = useNavigate();
  const { 
    selectedRole: contextRole, 
    experienceLevel: contextExperience,
    setSelectedRole: setContextRole,
    setExperience: setContextExperience,
    startInterview,
    clearSession,
  } = useInterview();

  const [selectedRole, setSelectedRole] = useState(contextRole || null);
  const [experience, setExperience] = useState(contextExperience || 1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Sync local state with context
  useEffect(() => {
    if (contextRole) {
      setSelectedRole(contextRole);
    }
    if (contextExperience !== undefined) {
      setExperience(contextExperience);
    }
  }, [contextRole, contextExperience]);

  const handleBeginInterview = async () => {
    if (!selectedRole) {
      toast.error("Please select an interview role");
      return;
    }

    // Clear any previous session
    clearSession();

    toast.info("Starting interview...");

    // Start new interview with backend
    const result = await startInterview(selectedRole, experience);
    
    if (result.success) {
      toast.success("Interview started! Good luck!");
      navigate("/interview");
    } else {
      toast.error(result.error || "Failed to start interview. Please try again.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedRole) {
      toast.error("Please select an interview role");
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select date and time");
      return;
    }

    try {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      
      const response = await scheduledAPI.create(
        selectedRole,
        experience,
        scheduledDateTime.toISOString(),
        scheduleNotes
      );

      if (response.success) {
        toast.success("Interview scheduled successfully!");
        setShowScheduleModal(false);
        setScheduleDate('');
        setScheduleTime('');
        setScheduleNotes('');
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Failed to schedule interview");
      }
    } catch (error) {
      toast.error("Failed to schedule interview: " + error.message);
    }
  };

  return (
    <MainLayout title="Select Your Role" subtitle="Choose interview type and experience level">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Role Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Interview Role</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {roles.map((role, index) => {
              const isSelected = selectedRole === role.id;
              const colors = colorClasses[role.color];

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    neon-card p-5 text-left transition-all duration-300 animate-fade-in
                    ${isSelected ? `border ${colors.border} ${colors.glow}` : "hover:border-border"}
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <role.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                        {isSelected && (
                          <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
                            <Check className={`w-4 h-4 ${colors.text}`} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div className="neon-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Experience Level</h2>
            <span className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 ${
              experience === 0 ? 'border-lime-500/50 bg-lime-500/10 text-lime-400' :
              experience === 1 ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' :
              experience === 2 ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' :
              experience === 3 ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' :
              'border-orange-500/50 bg-orange-500/10 text-orange-400'
            }`}>
              {experienceLevels[experience].badge}
            </span>
          </div>

          <div className="space-y-6">
            <input
              type="range"
              min={0}
              max={4}
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className={`w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-110
                ${experience === 0 ? '[&::-webkit-slider-thumb]:bg-lime-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgb(132,204,22,0.5)]' : ''}
                ${experience === 1 ? '[&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgb(6,182,212,0.5)]' : ''}
                ${experience === 2 ? '[&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgb(168,85,247,0.5)]' : ''}
                ${experience === 3 ? '[&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgb(234,179,8,0.5)]' : ''}
                ${experience === 4 ? '[&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgb(249,115,22,0.5)]' : ''}
              `}
            />
            
            {/* Level Details Card */}
            <div className={`p-4 rounded-xl border-2 ${
              experience === 0 ? 'border-lime-500/30 bg-gradient-to-br from-lime-500/10 to-green-500/10' :
              experience === 1 ? 'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10' :
              experience === 2 ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10' :
              experience === 3 ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10' :
              'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10'
            }`}>
              <h3 className="text-lg font-bold text-foreground mb-2">{experienceLevels[experience].label}</h3>
              <p className="text-sm text-muted-foreground mb-3">{experienceLevels[experience].description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-foreground">
                  <span className="font-semibold">{experienceLevels[experience].questions}</span> questions
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">
                  <span className="font-semibold">~{experienceLevels[experience].time}</span> minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Details */}
        {selectedRole && (
          <div className={`neon-card p-6 animate-fade-in border-2 ${
            experience === 0 ? 'border-lime-500/30' :
            experience === 1 ? 'border-cyan-500/30' :
            experience === 2 ? 'border-purple-500/30' :
            experience === 3 ? 'border-yellow-500/30' :
            'border-orange-500/30'
          }`}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Interview Preview</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  experience === 0 ? 'text-lime-400' :
                  experience === 1 ? 'text-cyan-400' :
                  experience === 2 ? 'text-purple-400' :
                  experience === 3 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  {experienceLevels[experience].questions}
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  experience === 0 ? 'text-lime-400' :
                  experience === 1 ? 'text-cyan-400' :
                  experience === 2 ? 'text-purple-400' :
                  experience === 3 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>~{experienceLevels[experience].time}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  experience === 0 ? 'text-lime-400' :
                  experience === 1 ? 'text-cyan-400' :
                  experience === 2 ? 'text-purple-400' :
                  experience === 3 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>AI</div>
                <div className="text-sm text-muted-foreground">Evaluation</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="xl"
            onClick={() => setShowScheduleModal(true)}
            disabled={!selectedRole}
            className="min-w-[200px]"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Schedule for Later
          </Button>
          <Button
            variant="neon-filled"
            size="xl"
            onClick={handleBeginInterview}
            disabled={!selectedRole}
            className="group min-w-[200px]"
          >
            Begin Interview
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neon-card p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">Schedule Interview</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border-2 border-border text-foreground font-medium focus:outline-none focus:border-primary focus:bg-card transition-all hover:border-primary/50 cursor-pointer [color-scheme:dark]"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border-2 border-border text-foreground font-medium focus:outline-none focus:border-primary focus:bg-card transition-all hover:border-primary/50 cursor-pointer [color-scheme:dark]"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Notes (Optional)</label>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="Add any notes or reminders..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all hover:border-primary/50 resize-none"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {scheduleNotes.length}/500
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduleDate('');
                    setScheduleTime('');
                    setScheduleNotes('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="neon-filled"
                  onClick={handleScheduleInterview}
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SelectRole;

