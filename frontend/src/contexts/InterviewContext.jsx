import { createContext, useContext, useState, useEffect } from 'react';
import { interviewAPI } from '@/services/api';

const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
  // Interview setup state
  const [selectedRole, setSelectedRole] = useState(null);
  const [experienceLevel, setExperience] = useState(1);
  
  // Interview session state
  const [currentInterviewId, setCurrentInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Results state
  const [currentResults, setCurrentResults] = useState(null);
  
  // Load saved session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('interviewSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setSelectedRole(session.selectedRole);
        setExperience(session.experienceLevel);
        setCurrentInterviewId(session.currentInterviewId);
        setQuestionNumber(session.questionNumber || 0);
        setAnswers(session.answers || []);
        setIsInterviewActive(session.isInterviewActive || false);
        setInterviewStartTime(session.interviewStartTime);
      } catch (error) {
        console.error('Error loading interview session:', error);
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (selectedRole || isInterviewActive) {
      const session = {
        selectedRole,
        experienceLevel,
        currentInterviewId,
        questionNumber,
        answers,
        isInterviewActive,
        interviewStartTime,
      };
      localStorage.setItem('interviewSession', JSON.stringify(session));
    }
  }, [selectedRole, experienceLevel, currentInterviewId, questionNumber, answers, isInterviewActive, interviewStartTime]);

  // Start interview - calls backend to create session and get first question
  const startInterview = async (role, experience) => {
    try {
      setIsLoading(true);
      setSelectedRole(role);
      setExperience(experience);
      
      // Call backend to start interview
      const response = await interviewAPI.startInterview(role, experience);
      
      setCurrentInterviewId(response.interviewId);
      setCurrentQuestion(response.question);
      setQuestionNumber(1);
      setTotalQuestions(response.totalQuestions || 5);
      setEstimatedTime(response.estimatedTime || 0);
      setAnswers([]);
      setIsInterviewActive(true);
      setInterviewStartTime(new Date().toISOString());
      setCurrentResults(null);
      
      return { success: true, question: response.question };
    } catch (error) {
      console.error('Failed to start interview:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer for current question and get evaluation
  const submitAnswer = async (answer, timeSpent) => {
    try {
      setIsLoading(true);
      
      if (!currentInterviewId || !currentQuestion) {
        throw new Error('No active interview session');
      }

      // Call backend to submit answer and get evaluation
      const response = await interviewAPI.submitAnswer(
        currentInterviewId,
        currentQuestion.id,
        answer,
        timeSpent
      );
      
      // Store answer with evaluation
      const newAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: answer,
        timeSpent: timeSpent,
        evaluation: response.evaluation,
        timestamp: new Date().toISOString(),
      };
      
      setAnswers([...answers, newAnswer]);
      
      return { success: true, evaluation: response.evaluation };
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Move to next question - fetch from backend
  const nextQuestion = async () => {
    try {
      setIsLoading(true);
      
      if (!currentInterviewId) {
        throw new Error('No active interview session');
      }

      // Check if we've reached the end
      if (questionNumber >= totalQuestions) {
        return { success: false, isComplete: true };
      }

      // Call backend to get next question
      const response = await interviewAPI.getNextQuestion(currentInterviewId);
      
      if (response.isComplete) {
        return { success: false, isComplete: true };
      }
      
      setCurrentQuestion(response.question);
      setQuestionNumber(questionNumber + 1);
      
      return { success: true, question: response.question };
    } catch (error) {
      console.error('Failed to get next question:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Complete interview - get final results from backend
  const completeInterview = async () => {
    try {
      setIsLoading(true);
      
      if (!currentInterviewId) {
        throw new Error('No active interview session');
      }

      const response = await interviewAPI.completeInterview(currentInterviewId);
      
      if (!response.results) {
        throw new Error('No results returned from backend');
      }
      
      setIsInterviewActive(false);
      setCurrentResults(response.results);
      
      return { success: true, results: response.results };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Get interview results by ID
  const getResults = async (interviewId) => {
    try {
      setIsLoading(true);
      const response = await interviewAPI.getResults(interviewId);
      return { success: true, results: response.results };
    } catch (error) {
      console.error('Failed to get results:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate interview duration
  const calculateDuration = () => {
    if (!interviewStartTime) return 0;
    const start = new Date(interviewStartTime);
    const end = new Date();
    return Math.floor((end - start) / 1000); // Duration in seconds
  };

  // Get interview history from backend
  const getHistory = async () => {
    try {
      const response = await interviewAPI.getHistory();
      return response.interviews || [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  };

  // Clear current session
  const clearSession = () => {
    setSelectedRole(null);
    setExperience(1);
    setCurrentInterviewId(null);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setAnswers([]);
    setIsInterviewActive(false);
    setInterviewStartTime(null);
    setCurrentResults(null);
    localStorage.removeItem('interviewSession');
  };

  // Reset to role selection
  const resetToRoleSelection = () => {
    clearSession();
  };

  const value = {
    // Setup state
    selectedRole,
    experienceLevel,
    setSelectedRole,
    setExperience,
    
    // Session state
    currentInterviewId,
    currentQuestion,
    questionNumber,
    totalQuestions,
    estimatedTime,
    answers,
    isInterviewActive,
    interviewStartTime,
    currentResults,
    isLoading,
    
    // Actions
    startInterview,
    submitAnswer,
    nextQuestion,
    completeInterview,
    getResults,
    clearSession,
    resetToRoleSelection,
    getHistory,
    calculateDuration,
  };

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
};

// Custom hook to use interview context
export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
