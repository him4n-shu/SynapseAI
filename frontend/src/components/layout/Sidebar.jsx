import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Play,
  History,
  User,
  LogOut,
  Home,
  Target,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { icon: Home, path: "/", label: "Home" },
  { icon: LayoutDashboard, path: "/dashboard", label: "Dashboard" },
  { icon: Target, path: "/select-role", label: "Start Interview" },
  { icon: History, path: "/history", label: "History" },
  { icon: User, path: "/profile", label: "Profile" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <Link to="/" className="mb-8 hover:opacity-80 transition-opacity">
        <Logo size="default" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group relative
                ${isActive
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--neon-lime)/0.3)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }
              `}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-14 px-2 py-1 bg-card rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleLogout}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-all duration-300"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-lime to-neon-cyan flex items-center justify-center text-primary-foreground font-semibold text-sm">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

