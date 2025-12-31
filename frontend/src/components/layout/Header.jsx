import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from 'date-fns';

const Header = ({ 
  title, 
  subtitle, 
  showFilters = false,
  onRoleChange,
  onTimeRangeChange,
  selectedRole = "all",
  selectedTimeRange = "all"
}) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const roleDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "frontend", label: "Frontend Engineer" },
    { value: "backend", label: "Backend Engineer" },
    { value: "hr", label: "HR Interview" },
    { value: "aiml", label: "AI / ML Engineer" },
  ];

  const timeRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (role) => {
    if (onRoleChange) {
      onRoleChange(role);
    }
    setShowRoleDropdown(false);
  };

  const handleTimeRangeSelect = (range) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
    setShowTimeDropdown(false);
  };

  const getSelectedRoleLabel = () => {
    return roles.find(r => r.value === selectedRole)?.label || "All Roles";
  };

  const getSelectedTimeRangeLabel = () => {
    return timeRanges.find(t => t.value === selectedTimeRange)?.label || "This Week";
  };

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showFilters && (
          <div className="flex items-center gap-2">
            <div className="relative" ref={roleDropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                {getSelectedRoleLabel()} <ChevronDown className="w-4 h-4" />
              </Button>
              {showRoleDropdown && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-card border border-border rounded-lg shadow-xl z-[100] py-1">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleRoleSelect(role.value)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                        selectedRole === role.value ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={timeDropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              >
                {getSelectedTimeRangeLabel()} <ChevronDown className="w-4 h-4" />
              </Button>
              {showTimeDropdown && (
                <div className="absolute top-full mt-2 right-0 w-40 bg-card border border-border rounded-lg shadow-xl z-[100] py-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleTimeRangeSelect(range.value)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                        selectedTimeRange === range.value ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="relative" ref={notificationDropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-full mt-2 right-0 w-96 bg-card border border-border rounded-lg shadow-xl z-[100] max-h-[32rem] overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              {notifications.length > 0 ? (
                <div className="divide-y divide-border overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 transition-colors relative ${
                        notification.isRead ? 'bg-transparent' : 'bg-primary/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        )}
                        {notification.isRead && (
                          <div className="w-2 h-2 mt-1.5 flex-shrink-0" />
                        )}
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (notification.action) {
                              notification.action();
                            }
                            if (!notification.isRead) {
                              markAsRead(notification.id);
                            }
                            setShowNotifications(false);
                          }}
                        >
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          {notification.timestamp && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(() => {
                                try {
                                  const date = new Date(notification.timestamp);
                                  if (isNaN(date.getTime())) {
                                    return 'Just now';
                                  }
                                  return formatDistanceToNowStrict(date, { addSuffix: true });
                                } catch (error) {
                                  return 'Just now';
                                }
                              })()}
                            </p>
                          )}
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 rounded hover:bg-muted/50 transition-colors flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-primary" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

