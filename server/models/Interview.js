import mongoose from 'mongoose';

// Question schema
const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  expectedDuration: {
    type: Number, // in seconds
    default: 120,
  },
});

// Answer schema
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
  },
  evaluation: {
    score: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    strengths: [String],
    improvements: [String],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Interview schema
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['frontend', 'backend', 'hr', 'aiml', 'fullstack', 'devops'],
      required: true,
    },
    experienceLevel: {
      type: Number,
      min: 0,
      max: 4,
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    currentQuestionNumber: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    questions: [questionSchema],
    answers: [answerSchema],
    results: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      averageScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      strengths: [String],
      weakAreas: [String],
      improvements: [String],
      summary: String,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (removed duplicates from lines 208-211)

// Calculate duration before saving
interviewSchema.pre('save', function (next) {
  if (this.completedAt && this.startedAt) {
    this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  next();
});

// Virtual for formatted duration
interviewSchema.virtual('formattedDuration').get(function () {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}m ${seconds}s`;
});

// Method to check if interview is complete
interviewSchema.methods.isComplete = function () {
  return this.status === 'completed';
};

// Method to get progress percentage
interviewSchema.methods.getProgress = function () {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.answers.length / this.totalQuestions) * 100);
};

// Static method to get user statistics
interviewSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        averageScore: { $avg: '$results.overallScore' },
        totalDuration: { $sum: '$duration' },
        highestScore: { $max: '$results.overallScore' },
        lowestScore: { $min: '$results.overallScore' },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: 0,
      totalDuration: 0,
      highestScore: 0,
      lowestScore: 0,
    };
  }

  return {
    totalInterviews: stats[0].totalInterviews,
    averageScore: Math.round(stats[0].averageScore),
    totalDuration: stats[0].totalDuration,
    highestScore: stats[0].highestScore,
    lowestScore: stats[0].lowestScore,
  };
};

// Add indexes for better query performance
interviewSchema.index({ user: 1, createdAt: -1 }); // For user's interview history
interviewSchema.index({ status: 1 }); // For filtering by status
interviewSchema.index({ role: 1, experienceLevel: 1 }); // For analytics
interviewSchema.index({ user: 1, status: 1 }); // For user's completed interviews

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
