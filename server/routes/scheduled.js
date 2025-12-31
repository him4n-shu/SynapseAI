import express from 'express';
import ScheduledInterview from '../models/ScheduledInterview.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all scheduled interviews for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const scheduledInterviews = await ScheduledInterview.find({
      userId: req.user._id,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() } // Only future interviews
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      scheduledInterviews
    });
  } catch (error) {
    console.error('Error fetching scheduled interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled interviews'
    });
  }
});

// Create a new scheduled interview
router.post('/', verifyToken, async (req, res) => {
  try {
    const { role, experienceLevel, scheduledDate, notes } = req.body;

    // Validate required fields
    if (!role || experienceLevel === undefined || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Role, experience level, and scheduled date are required'
      });
    }

    // Validate scheduled date is in the future
    const schedDate = new Date(scheduledDate);
    if (schedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }

    const scheduledInterview = new ScheduledInterview({
      userId: req.user._id,
      role,
      experienceLevel,
      scheduledDate: schedDate,
      notes: notes || ''
    });

    await scheduledInterview.save();

    res.status(201).json({
      success: true,
      scheduledInterview
    });
  } catch (error) {
    console.error('Error creating scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduled interview'
    });
  }
});

// Update a scheduled interview
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, experienceLevel, scheduledDate, notes, status } = req.body;

    const scheduledInterview = await ScheduledInterview.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!scheduledInterview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }

    // Update fields if provided
    if (role) scheduledInterview.role = role;
    if (experienceLevel !== undefined) scheduledInterview.experienceLevel = experienceLevel;
    if (scheduledDate) {
      const schedDate = new Date(scheduledDate);
      if (schedDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }
      scheduledInterview.scheduledDate = schedDate;
    }
    if (notes !== undefined) scheduledInterview.notes = notes;
    if (status) scheduledInterview.status = status;

    await scheduledInterview.save();

    res.json({
      success: true,
      scheduledInterview
    });
  } catch (error) {
    console.error('Error updating scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled interview'
    });
  }
});

// Delete a scheduled interview
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ScheduledInterview.deleteOne({
      _id: id,
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }

    res.json({
      success: true,
      message: 'Scheduled interview deleted'
    });
  } catch (error) {
    console.error('Error deleting scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheduled interview'
    });
  }
});

// Cancel a scheduled interview (soft delete)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const scheduledInterview = await ScheduledInterview.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!scheduledInterview) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled interview not found'
      });
    }

    scheduledInterview.status = 'cancelled';
    await scheduledInterview.save();

    res.json({
      success: true,
      message: 'Scheduled interview cancelled'
    });
  } catch (error) {
    console.error('Error cancelling scheduled interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled interview'
    });
  }
});

export default router;

