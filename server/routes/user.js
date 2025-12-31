import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Interview from '../models/Interview.js';

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        preferredRole: user.preferredRole,
        experienceLevel: user.experienceLevel,
        totalInterviews: user.totalInterviews,
        averageScore: user.averageScore,
        totalPracticeTime: user.totalPracticeTime,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, preferredRole, experienceLevel } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (preferredRole) {
      const validRoles = ['frontend', 'backend', 'hr', 'aiml', 'fullstack', 'devops'];
      if (!validRoles.includes(preferredRole)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        });
      }
      user.preferredRole = preferredRole;
    }

    if (experienceLevel !== undefined) {
      if (experienceLevel < 0 || experienceLevel > 4) {
        return res.status(400).json({
          success: false,
          message: 'Experience level must be between 0 and 4',
        });
      }
      user.experienceLevel = experienceLevel;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferredRole: user.preferredRole,
        experienceLevel: user.experienceLevel,
        totalInterviews: user.totalInterviews,
        averageScore: user.averageScore,
        totalPracticeTime: user.totalPracticeTime,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/user/stats
 * @desc    Get comprehensive user statistics for dashboard
 * @access  Private
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get total completed interviews
    const totalCompleted = await Interview.countDocuments({
      user: req.user._id,
      status: 'completed',
    });

    // Get interviews completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = await Interview.countDocuments({
      user: req.user._id,
      status: 'completed',
      completedAt: { $gte: today },
    });

    // Get recent interviews (last 5)
    const recentInterviews = await Interview.find({
      user: req.user._id,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('role results.overallScore completedAt duration');

    // Get interviews by role
    const interviewsByRole = await Interview.aggregate([
      {
        $match: {
          user: user._id,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgScore: { $avg: '$results.overallScore' },
          totalDuration: { $sum: '$duration' },
        },
      },
    ]);

    // Get weekly performance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyPerformance = await Interview.find({
      user: req.user._id,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo },
    })
      .sort({ completedAt: 1 })
      .select('results.overallScore completedAt');

    // Calculate pass rate (score >= 75)
    const passedInterviews = await Interview.countDocuments({
      user: req.user._id,
      status: 'completed',
      'results.overallScore': { $gte: 75 },
    });

    const passRate = totalCompleted > 0 
      ? Math.round((passedInterviews / totalCompleted) * 100) 
      : 0;

    // Get highest and lowest scores
    const scoreStats = await Interview.aggregate([
      {
        $match: {
          user: user._id,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          highestScore: { $max: '$results.overallScore' },
          lowestScore: { $min: '$results.overallScore' },
        },
      },
    ]);

    const highestScore = scoreStats.length > 0 ? scoreStats[0].highestScore : 0;
    const lowestScore = scoreStats.length > 0 ? scoreStats[0].lowestScore : 0;

    res.json({
      success: true,
      stats: {
        // Overall stats
        totalInterviews: totalCompleted,
        completedToday,
        averageScore: user.averageScore,
        totalPracticeTime: user.totalPracticeTime,
        passRate,
        highestScore,
        lowestScore,
        
        // Recent interviews
        recentInterviews: recentInterviews.map(i => ({
          id: i._id,
          role: i.role,
          score: i.results?.overallScore || 0,
          date: i.completedAt,
          duration: i.duration,
        })),
        
        // Interviews by role
        interviewsByRole: interviewsByRole.map(r => ({
          role: r._id,
          count: r.count,
          avgScore: Math.round(r.avgScore),
          totalDuration: r.totalDuration,
        })),
        
        // Weekly performance
        weeklyPerformance: weeklyPerformance.map(i => ({
          score: i.results?.overallScore || 0,
          date: i.completedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message,
    });
  }
});

export default router;
