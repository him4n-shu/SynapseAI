import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInterview } from './InterviewContext';
import { useAuth } from './AuthContext';
import { scheduledAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { getHistory } = useInterview();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const generateNotifications = async () => {
    if (!isAuthenticated()) return;

    try {
      const history = await getHistory();
      if (!history || history.length === 0) {
        setNotifications([]);
        return;
      }

      const newNotifications = [];

      // Scheduled interviews notifications
      try {
        const scheduledResponse = await scheduledAPI.getScheduled();
        if (scheduledResponse.success && scheduledResponse.scheduledInterviews) {
          const scheduled = scheduledResponse.scheduledInterviews;
          
          // Upcoming interviews (within 24 hours)
          const upcomingInterviews = scheduled.filter(interview => {
            const schedDate = new Date(interview.scheduledDate);
            const now = new Date();
            const diffHours = (schedDate - now) / (1000 * 60 * 60);
            return diffHours > 0 && diffHours <= 24;
          });

          if (upcomingInterviews.length > 0) {
            const nextInterview = upcomingInterviews[0];
            const schedDate = new Date(nextInterview.scheduledDate);
            const now = new Date();
            const diffHours = Math.round((schedDate - now) / (1000 * 60 * 60));
            
            newNotifications.push({
              id: `upcoming-${nextInterview._id}`,
              type: 'info',
              title: 'Upcoming Interview',
              message: `${nextInterview.role.charAt(0).toUpperCase() + nextInterview.role.slice(1)} interview in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`,
              timestamp: nextInterview.scheduledDate,
              action: '/select-role'
            });
          }

          // All scheduled interviews count
          if (scheduled.length > 0) {
            newNotifications.push({
              id: 'scheduled-count',
              type: 'info',
              title: 'Scheduled Interviews',
              message: `You have ${scheduled.length} interview${scheduled.length > 1 ? 's' : ''} scheduled`,
              timestamp: new Date().toISOString(),
              action: '/dashboard'
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch scheduled interviews for notifications:', error);
      }

      // In-progress interviews
      const inProgress = history.filter(i => i.status === 'in-progress');
      if (inProgress.length > 0) {
        newNotifications.push({
          id: 'in-progress',
          type: 'info',
          title: 'Interview In Progress',
          message: `You have ${inProgress.length} interview${inProgress.length > 1 ? 's' : ''} waiting to be completed`,
          timestamp: inProgress[0].startedAt || new Date().toISOString(),
          action: '/interview'
        });
      }

      // Recent completions (last 24 hours)
      const recentCompletions = history.filter(interview => {
        const completedDate = new Date(interview.completedAt);
        const now = new Date();
        const diffHours = (now - completedDate) / (1000 * 60 * 60);
        return diffHours <= 24 && interview.status === 'completed';
      });

      if (recentCompletions.length > 0) {
        const latestInterview = recentCompletions[0];
        const score = latestInterview.results?.overallScore || 0;
        newNotifications.push({
          id: `recent-${latestInterview._id}`,
          type: score >= 70 ? 'success' : 'warning',
          title: score >= 70 ? 'Great Job!' : 'Keep Practicing',
          message: `You scored ${score}% in your ${latestInterview.role} interview`,
          timestamp: latestInterview.completedAt,
          action: '/results',
          interviewId: latestInterview._id
        });
      }

      // Low score interviews
      const needWork = history.filter(i => 
        i.results?.overallScore < 60 && i.status === 'completed'
      );
      if (needWork.length > 0) {
        newNotifications.push({
          id: 'need-work',
          type: 'warning',
          title: 'Improvement Needed',
          message: `${needWork.length} interview${needWork.length > 1 ? 's' : ''} need more practice`,
          timestamp: needWork[0].completedAt || new Date().toISOString(),
          action: '/history'
        });
      }

      // Achievements
      const passed = history.filter(i => i.results?.overallScore >= 70).length;
      const total = history.filter(i => i.status === 'completed').length;
      if (passed >= 5 && total > 0 && (passed / total) >= 0.8) {
        newNotifications.push({
          id: 'achievement',
          type: 'success',
          title: 'Achievement Unlocked! 🎉',
          message: `${Math.round((passed / total) * 100)}% success rate with ${passed} interviews passed`,
          timestamp: new Date().toISOString(),
          action: '/dashboard'
        });
      }

      // Weekly progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekInterviews = history.filter(interview => {
        const interviewDate = new Date(interview.completedAt);
        return interviewDate >= weekStart && interview.status === 'completed';
      });

      if (weekInterviews.length >= 3) {
        const weekAvgScore = Math.round(
          weekInterviews.reduce((sum, i) => sum + (i.results?.overallScore || 0), 0) / weekInterviews.length
        );
        newNotifications.push({
          id: 'weekly-progress',
          type: 'info',
          title: 'Weekly Progress',
          message: `You completed ${weekInterviews.length} interviews this week with ${weekAvgScore}% average`,
          timestamp: weekInterviews[0].completedAt || new Date().toISOString(),
          action: '/history'
        });
      }

      // Mark notifications as read or unread based on localStorage
      const notificationsWithReadStatus = newNotifications.slice(0, 5).map(notif => ({
        ...notif,
        isRead: readNotifications.includes(notif.id)
      }));

      setNotifications(notificationsWithReadStatus);
    } catch (error) {
      console.error('Failed to generate notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      generateNotifications();
      // Refresh notifications every 5 minutes
      const interval = setInterval(generateNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, readNotifications]);

  const refreshNotifications = () => {
    generateNotifications();
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId) => {
    const updatedReadNotifications = [...readNotifications, notificationId];
    setReadNotifications(updatedReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
    
    // Update the notification's read status immediately
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    const allNotificationIds = notifications.map(n => n.id);
    setReadNotifications(allNotificationIds);
    localStorage.setItem('readNotifications', JSON.stringify(allNotificationIds));
    
    // Update all notifications' read status
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount,
      refreshNotifications,
      clearNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

