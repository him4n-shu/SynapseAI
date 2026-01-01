import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

// Load environment variables FIRST before any other imports that use them
dotenv.config();

// Import configurations AFTER dotenv is loaded
import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import { testOpenAIConnection } from './config/openai.js';

// Import routes
import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import userRoutes from './routes/user.js';
import scheduledRoutes from './routes/scheduled.js';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Test OpenAI connection
testOpenAIConnection();

// Configure Passport
configurePassport();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 24 hours in seconds
      autoRemove: 'native',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scheduled', scheduledRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SynapseAI - AI Mock Interview API',
    version: '1.0.0',
    tagline: 'Connect to Your Career',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      interview: '/api/interview',
      user: '/api/user',
      scheduled: '/api/scheduled',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠 SynapseAI API Server                            ║
║   💡 Connect to Your Career                          ║
║                                                       ║
║   📡 Server running on port ${PORT}                     ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   🔗 API URL: http://localhost:${PORT}                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

