import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Check if Google OAuth is properly configured
const isGoogleConfigured = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  console.log('🔍 Checking Google OAuth configuration:');
  console.log('   Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'Not set');
  console.log('   Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'Not set');

  const configured = clientId &&
         clientSecret &&
         clientId !== 'your_google_client_id_here' &&
         clientSecret !== 'your_google_client_secret_here' &&
         clientId.length > 10 &&
         clientSecret.length > 10;

  console.log('   Configured:', configured);
  return configured;
};

// Only configure Google OAuth strategy if credentials are properly set
if (isGoogleConfigured()) {
  console.log('✅ Google OAuth configured successfully');

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth Profile:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      console.log('✅ Existing Google user found:', user.email);
      return done(null, user);
    }

    // Check if user exists with the same email
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await User.findOne({ email: email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.avatar = profile.photos?.[0]?.value;
        await user.save();
        
        console.log('🔗 Linked Google account to existing user:', user.email);
        return done(null, user);
      }
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      username: profile.emails?.[0]?.value?.split('@')[0] || `user_${profile.id}`,
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatar: profile.photos?.[0]?.value,
      role: 'customer',
      isEmailVerified: true, // Google emails are pre-verified
      authProvider: 'google',
      createdAt: new Date()
    });

    await newUser.save();
    console.log('✅ New Google user created:', newUser.email);
    
    return done(null, newUser);
    
  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
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
} else {
  console.log('⚠️  Google OAuth not configured - using placeholder credentials');
  console.log('   Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
  console.log('   See GOOGLE_OAUTH_SETUP.md for setup instructions');
}

export default passport;
