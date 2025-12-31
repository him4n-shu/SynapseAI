import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated with backend
  const checkAuthStatus = async () => {
    try {
      const userData = await authAPI.checkAuth();
      if (userData) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Signup with email/password
  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup(name, email, password);
      if (response.success) {
        await checkAuthStatus();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        await checkAuthStatus();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  // Handle OAuth callback (called after redirect from Google)
  const handleOAuthCallback = async (token) => {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
        await checkAuthStatus();
        return { success: true };
      }
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('OAuth callback failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('interviewSession'); // Clear interview data on logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('interviewSession');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    isAuthenticated,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

