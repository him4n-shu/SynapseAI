import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, update last login and avatar (in case it changed)
            user.lastLogin = new Date();
            user.avatar = profile.photos[0]?.value || user.avatar;
            user.name = profile.displayName || user.name;
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            provider: 'google',
          });

          done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
};

export default configurePassport;

