import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['google', 'email'],
      default: 'email',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    // User preferences
    preferredRole: {
      type: String,
      enum: ['frontend', 'backend', 'hr', 'aiml', 'fullstack', 'devops'],
      default: null,
    },
    experienceLevel: {
      type: Number,
      min: 0,
      max: 4,
      default: 1,
    },
    // Statistics
    totalInterviews: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    totalPracticeTime: {
      type: Number,
      default: 0, // in seconds
    },
  },
  {
    timestamps: true,
  }
);

// Update statistics method
userSchema.methods.updateStats = async function (interviewData) {
  this.totalInterviews += 1;
  
  // Calculate new average score
  const totalScore = this.averageScore * (this.totalInterviews - 1) + interviewData.score;
  this.averageScore = Math.round(totalScore / this.totalInterviews);
  
  // Add practice time
  this.totalPracticeTime += interviewData.duration;
  
  await this.save();
};

// Add indexes for better query performance
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ lastLogin: -1 }); // For recent users

const User = mongoose.model('User', userSchema);

export default User;

