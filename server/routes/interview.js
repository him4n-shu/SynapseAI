import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import { 
  generateQuestion, 
  evaluateAnswer, 
  generateFinalFeedback,
  getInterviewConfig
} from '../services/openaiService.js';

const router = express.Router();

/**
 * @route   POST /api/interview/start
 * @desc    Start a new interview session and generate first question
 * @access  Private
 */
router.post('/start', verifyToken, async (req, res) => {
  try {
    const { role, experienceLevel } = req.body;

    // Validation
    if (!role || experienceLevel === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Role and experience level are required',
      });
    }

    // Validate role
    const validRoles = ['frontend', 'backend', 'hr', 'aiml', 'fullstack', 'devops'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Validate experience level
    if (experienceLevel < 0 || experienceLevel > 4) {
      return res.status(400).json({
        success: false,
        message: 'Experience level must be between 0 and 4',
      });
    }

    // Get interview configuration based on experience level
    const config = getInterviewConfig(experienceLevel);

    // Generate first question using OpenAI
    const questionResult = await generateQuestion(role, experienceLevel, []);

    if (!questionResult.success) {
      throw new Error('Failed to generate first question');
    }

    // Create interview session in database
    const interview = await Interview.create({
      user: req.user._id,
      role,
      experienceLevel,
      status: 'in-progress',
      currentQuestionNumber: 1,
      totalQuestions: config.questions,
      questions: [questionResult.question],
    });

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      question: questionResult.question,
      questionNumber: 1,
      totalQuestions: config.questions,
      estimatedTime: config.totalTime,
      message: 'Interview started successfully',
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/interview/:id/next-question
 * @desc    Generate and return the next question
 * @access  Private
 */
router.get('/:id/next-question', verifyToken, async (req, res) => {
  try {
    const interviewId = req.params.id;

    // Get interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Verify ownership
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview',
      });
    }

    // Check if interview is already completed
    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview is already completed',
      });
    }

    // Check if we've reached the total number of questions
    if (interview.questions.length >= interview.totalQuestions) {
      return res.json({
        success: true,
        isComplete: true,
        message: 'All questions have been asked',
      });
    }

    // Get previously asked questions to avoid duplicates
    const previousQuestions = interview.questions.map(q => q.text);

    // Generate next question using OpenAI
    const questionResult = await generateQuestion(
      interview.role,
      interview.experienceLevel,
      previousQuestions
    );

    if (!questionResult.success) {
      throw new Error('Failed to generate next question');
    }

    // Add question to interview
    interview.questions.push(questionResult.question);
    interview.currentQuestionNumber = interview.questions.length;
    await interview.save();

    res.json({
      success: true,
      question: questionResult.question,
      questionNumber: interview.currentQuestionNumber,
      totalQuestions: interview.totalQuestions,
      isComplete: false,
    });
  } catch (error) {
    console.error('Next question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next question',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/interview/:id/submit-answer
 * @desc    Submit answer and get evaluation
 * @access  Private
 */
router.post('/:id/submit-answer', verifyToken, async (req, res) => {
  try {
    const { questionId, answer, timeSpent } = req.body;
    const interviewId = req.params.id;

    // Validation
    if (!questionId || answer === undefined || timeSpent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Question ID, answer, and time spent are required',
      });
    }

    // Get interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Verify ownership
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview',
      });
    }

    // Find the question
    const question = interview.questions.find(q => q.id === questionId);

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question not found in this interview',
      });
    }

    // Check if answer already submitted for this question
    const existingAnswer = interview.answers.find(a => a.questionId === questionId);
    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Answer already submitted for this question',
      });
    }

    // Evaluate answer using OpenAI
    const evaluationResult = await evaluateAnswer(
      question.text,
      answer,
      interview.role,
      interview.experienceLevel
    );

    if (!evaluationResult.success) {
      throw new Error('Failed to evaluate answer');
    }

    // Save answer with evaluation
    interview.answers.push({
      questionId: question.id,
      question: question.text,
      answer: answer.trim(),
      timeSpent,
      evaluation: evaluationResult.evaluation,
      timestamp: new Date(),
    });

    await interview.save();

    res.json({
      success: true,
      evaluation: evaluationResult.evaluation,
      answersCount: interview.answers.length,
      totalQuestions: interview.totalQuestions,
      message: 'Answer submitted and evaluated successfully',
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/interview/:id/complete
 * @desc    Complete interview and generate comprehensive feedback
 * @access  Private
 */
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const interviewId = req.params.id;

    // Get interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Verify ownership
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview',
      });
    }

    // Check if already completed
    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview is already completed',
      });
    }

    // Check if at least one answer was submitted
    if (interview.answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete interview without any answers',
      });
    }

    // Generate comprehensive feedback using OpenAI
    const feedbackResult = await generateFinalFeedback(
      interview.role,
      interview.experienceLevel,
      interview.answers
    );

    if (!feedbackResult.success) {
      throw new Error('Failed to generate final feedback');
    }

    // Update interview with results
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.results = {
      overallScore: feedbackResult.overallScore,
      averageScore: feedbackResult.averageScore,
      strengths: feedbackResult.feedback.strengths,
      weakAreas: feedbackResult.feedback.weakAreas,
      improvements: feedbackResult.feedback.improvements,
      summary: feedbackResult.feedback.summary,
    };

    await interview.save();

    res.json({
      success: true,
      results: {
        interviewId: interview._id,
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        overallScore: feedbackResult.overallScore,
        averageScore: feedbackResult.averageScore,
        strengths: feedbackResult.feedback.strengths,
        weakAreas: feedbackResult.feedback.weakAreas,
        improvements: feedbackResult.feedback.improvements,
        summary: feedbackResult.feedback.summary,
        answers: interview.answers.map(a => ({
          question: a.question,
          answer: a.answer,
          score: a.evaluation?.score || 0,
          feedback: a.evaluation?.feedback,
          timeSpent: a.timeSpent,
        })),
        duration: interview.duration,
        completedAt: interview.completedAt,
      },
      message: 'Interview completed successfully',
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/interview/:id/results
 * @desc    Get interview results
 * @access  Private
 */
router.get('/:id/results', verifyToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Verify ownership
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview',
      });
    }

    // Check if interview is completed
    if (interview.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview is not yet completed',
      });
    }

    res.json({
      success: true,
      results: {
        interviewId: interview._id,
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        overallScore: interview.results.overallScore,
        averageScore: interview.results.averageScore,
        strengths: interview.results.strengths,
        weakAreas: interview.results.weakAreas,
        improvements: interview.results.improvements,
        summary: interview.results.summary,
        answers: interview.answers.map(a => ({
          question: a.question,
          answer: a.answer,
          score: a.evaluation?.score || 0,
          feedback: a.evaluation?.feedback,
          strengths: a.evaluation?.strengths || [],
          improvements: a.evaluation?.improvements || [],
          timeSpent: a.timeSpent,
        })),
        duration: interview.duration,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview results',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/interview/history
 * @desc    Get user's interview history
 * @access  Private
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { limit = 20, page = 1, status = 'completed' } = req.query;

    const query = {
      user: req.user._id,
    };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('role experienceLevel status results.overallScore completedAt duration answers');

    const total = await Interview.countDocuments(query);

    res.json({
      success: true,
      interviews: interviews.map(i => ({
        id: i._id,
        role: i.role,
        experienceLevel: i.experienceLevel,
        status: i.status,
        score: i.results?.overallScore || 0,
        completedAt: i.completedAt,
        duration: i.duration,
        questionsAnswered: i.answers?.length || 0,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview history',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/interview/:id
 * @desc    Get interview details
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Verify ownership
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview',
      });
    }

    res.json({
      success: true,
      interview: {
        id: interview._id,
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        status: interview.status,
        currentQuestionNumber: interview.currentQuestionNumber,
        totalQuestions: interview.totalQuestions,
        questions: interview.questions,
        answers: interview.answers,
        results: interview.results,
        duration: interview.duration,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview details',
      error: error.message,
    });
  }
});

export default router;
