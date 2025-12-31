// API Service Layer for Backend Communication

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const authFetch = (url, options = {}) => {
  const token = getAuthToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session
  });
};

// ==================== AUTH APIs ====================

export const authAPI = {
  // Check authentication status
  checkAuth: async () => {
    try {
      const response = await authFetch(`${API_URL}/api/auth/me`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await authFetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
      });
      localStorage.removeItem('authToken');
      return await handleResponse(response);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Get Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${API_URL}/api/auth/google`;
  },

  // Signup with email/password
  signup: async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  },

  // Login with email/password
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
};

// ==================== USER APIs ====================

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await authFetch(`${API_URL}/api/user/profile`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await authFetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await authFetch(`${API_URL}/api/user/stats`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get stats failed:', error);
      throw error;
    }
  },
};

// ==================== INTERVIEW APIs ====================

export const interviewAPI = {
  // Start a new interview session
  startInterview: async (role, experienceLevel) => {
    try {
      const response = await authFetch(`${API_URL}/api/interview/start`, {
        method: 'POST',
        body: JSON.stringify({ role, experienceLevel }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Start interview failed:', error);
      throw error;
    }
  },

  // Get next question
  getNextQuestion: async (interviewId) => {
    try {
      const response = await authFetch(
        `${API_URL}/api/interview/${interviewId}/next-question`
      );
      return await handleResponse(response);
    } catch (error) {
      console.error('Get next question failed:', error);
      throw error;
    }
  },

  // Submit answer
  submitAnswer: async (interviewId, questionId, answer, timeSpent) => {
    try {
      const response = await authFetch(
        `${API_URL}/api/interview/${interviewId}/submit-answer`,
        {
          method: 'POST',
          body: JSON.stringify({ questionId, answer, timeSpent }),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error('Submit answer failed:', error);
      throw error;
    }
  },

  // Complete interview
  completeInterview: async (interviewId) => {
    try {
      const response = await authFetch(
        `${API_URL}/api/interview/${interviewId}/complete`,
        {
          method: 'POST',
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error('Complete interview failed:', error);
      throw error;
    }
  },

  // Get interview results
  getResults: async (interviewId) => {
    try {
      const response = await authFetch(
        `${API_URL}/api/interview/${interviewId}/results`
      );
      return await handleResponse(response);
    } catch (error) {
      console.error('Get results failed:', error);
      throw error;
    }
  },

  // Get interview history
  getHistory: async () => {
    try {
      const response = await authFetch(`${API_URL}/api/interview/history`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get history failed:', error);
      throw error;
    }
  },

  // Get specific interview details
  getInterviewDetails: async (interviewId) => {
    try {
      const response = await authFetch(`${API_URL}/api/interview/${interviewId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get interview details failed:', error);
      throw error;
    }
  },
};

// Scheduled Interview API
export const scheduledAPI = {
  // Get all scheduled interviews
  getScheduled: async () => {
    try {
      const response = await authFetch(`${API_URL}/api/scheduled`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get scheduled interviews failed:', error);
      throw error;
    }
  },

  // Create a new scheduled interview
  create: async (role, experienceLevel, scheduledDate, notes = '') => {
    try {
      const response = await authFetch(`${API_URL}/api/scheduled`, {
        method: 'POST',
        body: JSON.stringify({ role, experienceLevel, scheduledDate, notes }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Create scheduled interview failed:', error);
      throw error;
    }
  },

  // Update a scheduled interview
  update: async (id, data) => {
    try {
      const response = await authFetch(`${API_URL}/api/scheduled/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update scheduled interview failed:', error);
      throw error;
    }
  },

  // Delete a scheduled interview
  delete: async (id) => {
    try {
      const response = await authFetch(`${API_URL}/api/scheduled/${id}`, {
        method: 'DELETE',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete scheduled interview failed:', error);
      throw error;
    }
  },

  // Cancel a scheduled interview
  cancel: async (id) => {
    try {
      const response = await authFetch(`${API_URL}/api/scheduled/${id}/cancel`, {
        method: 'PATCH',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Cancel scheduled interview failed:', error);
      throw error;
    }
  },
};

// Export API_URL for direct use if needed
export { API_URL };

