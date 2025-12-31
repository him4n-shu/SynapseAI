import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import SkeletonCard from "@/components/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/api";
import { toast } from "sonner";
import { User, Mail, Target, LogOut, Check, Loader2, Edit2, X } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredRole, setPreferredRole] = useState("frontend");
  const [experienceLevel, setExperienceLevel] = useState(2);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);

  const roles = [
    { id: "frontend", label: "Frontend Engineer" },
    { id: "backend", label: "Backend Engineer" },
    { id: "fullstack", label: "Fullstack Engineer" },
    { id: "mobile", label: "Mobile Developer" },
    { id: "devops", label: "DevOps Engineer" },
    { id: "hr", label: "HR Interview" },
  ];

  const experienceLevels = [
    { value: 0, label: "Fresher" },
    { value: 1, label: "Junior (0-1 years)" },
    { value: 2, label: "Mid-level (1-3 years)" },
    { value: 3, label: "Senior (3-5 years)" },
    { value: 4, label: "Expert (5+ years)" },
  ];

  // Fetch user profile and stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile
        const profileResponse = await userAPI.getProfile();
        setUserData(profileResponse.user);
        setName(profileResponse.user.name || "");
        setEmail(profileResponse.user.email || "");
        setPreferredRole(profileResponse.user.preferredRole || "frontend");
        setExperienceLevel(profileResponse.user.experienceLevel || 2);
        
        // Fetch stats
        const statsResponse = await userAPI.getStats();
        setStats(statsResponse.stats);
        
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      await userAPI.updateProfile({
        name,
        preferredRole,
        experienceLevel,
      });
      
      toast.success("Profile updated successfully!");
      
      // Refresh user data
      const profileResponse = await userAPI.getProfile();
      setUserData(profileResponse.user);
      
      // Close edit mode
      setIsEditingPreferences(false);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    // Reset to original values
    setPreferredRole(userData?.preferredRole || "frontend");
    setExperienceLevel(userData?.experienceLevel || 2);
    setIsEditingPreferences(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  // Format practice time
  const formatPracticeTime = (seconds) => {
    if (!seconds) return "0h";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <MainLayout title="Profile & Settings" subtitle="Manage your account and preferences">
        <div className="max-w-2xl mx-auto space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile & Settings" subtitle="Manage your account and preferences">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="neon-card p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {userData?.avatar ? (
                <>
                  <img
                    src={userData.avatar}
                    alt={userData.name || "User"}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-primary"
                    referrerPolicy="no-referrer"
                  />
                  <div 
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-lime to-neon-cyan flex items-center justify-center text-3xl font-bold text-primary-foreground border-2 border-primary"
                    style={{ display: 'none' }}
                  >
                    {getUserInitials(userData?.name || authUser?.name)}
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-lime to-neon-cyan flex items-center justify-center text-3xl font-bold text-primary-foreground border-2 border-primary">
                  {getUserInitials(userData?.name || authUser?.name)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{userData?.name || "User"}</h2>
              <p className="text-muted-foreground">{userData?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 rounded-full bg-neon-lime/10 text-neon-lime text-xs font-medium">
                  {userData?.provider === "google" ? "Google Account" : "Member"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Since {formatDate(userData?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={name || ""}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-foreground focus:outline-none mt-1"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email || ""}
                  disabled
                  className="w-full bg-transparent text-muted-foreground focus:outline-none mt-1 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed (Google account)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Preferences */}
        <div className="neon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-neon-lime" />
              <h3 className="font-medium text-foreground">Interview Preferences</h3>
            </div>
            {!isEditingPreferences && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPreferences(true)}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>

          {!isEditingPreferences ? (
            // Display mode
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Preferred Role</span>
                <span className="font-medium text-foreground">
                  {roles.find(r => r.id === preferredRole)?.label || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Experience Level</span>
                <span className="font-medium text-foreground">
                  {experienceLevels.find(l => l.value === experienceLevel)?.label || "Not set"}
                </span>
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="space-y-6">
              {/* Preferred Role */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Preferred Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setPreferredRole(role.id)}
                      className={`
                        p-4 rounded-lg border transition-all text-left
                        ${
                          preferredRole === role.id
                            ? "border-neon-lime bg-neon-lime/10"
                            : "border-border bg-muted/30 hover:border-muted-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            preferredRole === role.id ? "text-neon-lime" : "text-foreground"
                          }`}
                        >
                          {role.label}
                        </span>
                        {preferredRole === role.id && (
                          <Check className="w-4 h-4 text-neon-lime" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Experience Level</label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setExperienceLevel(level.value)}
                      className={`
                        w-full p-4 rounded-lg border transition-all text-left
                        ${
                          experienceLevel === level.value
                            ? "border-neon-purple bg-neon-purple/10"
                            : "border-border bg-muted/30 hover:border-muted-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            experienceLevel === level.value ? "text-neon-purple" : "text-foreground"
                          }`}
                        >
                          {level.label}
                        </span>
                        {experienceLevel === level.value && (
                          <Check className="w-4 h-4 text-neon-purple" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1 gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <LoadingButton
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </LoadingButton>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>

        {/* Stats */}
        <div className="neon-card p-6">
          <h3 className="font-medium text-foreground mb-4">Your Stats</h3>
          {stats ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neon-lime">
                  {stats.totalInterviews || 0}
                </div>
                <div className="text-xs text-muted-foreground">Interviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-purple">
                  {stats.averageScore ? `${Math.round(stats.averageScore)}%` : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-cyan">
                  {formatPracticeTime(stats.totalPracticeTime || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Practice Time</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;

