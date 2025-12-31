import mongoose from 'mongoose';

const scheduledInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'hr', 'aiml']
  },
  experienceLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for finding upcoming scheduled interviews
scheduledInterviewSchema.index({ userId: 1, scheduledDate: 1, status: 1 });

const ScheduledInterview = mongoose.model('ScheduledInterview', scheduledInterviewSchema);

export default ScheduledInterview;

