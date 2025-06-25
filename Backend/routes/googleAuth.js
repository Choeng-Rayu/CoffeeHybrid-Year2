import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Check if Google OAuth is configured
const isGoogleConfigured = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return clientId &&
         clientSecret &&
         clientId !== 'your_google_client_id_here' &&
         clientSecret !== 'your_google_client_secret_here' &&
         clientId.length > 10 &&
         clientSecret.length > 10;
};

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured()) {
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.netlify.app')
      : (process.env.CLIENT_URL || 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
  }

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  if (!isGoogleConfigured()) {
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.netlify.app')
      : (process.env.CLIENT_URL || 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
  }

  passport.authenticate('google', {
    failureRedirect: (process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.netlify.app')
      : (process.env.CLIENT_URL || 'http://localhost:5173')) + '/login?error=oauth_failed',
    session: false
  })(req, res, next);
}, async (req, res) => {
    try {
      const user = req.user;
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      // Prepare user data for frontend
      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      };

      // Determine frontend URL based on environment
      let frontendUrl;
      if (process.env.NODE_ENV === 'production') {
        frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.netlify.app';
      } else {
        frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      }

      // Redirect to frontend with token and user data
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;

      console.log('✅ Google OAuth successful, redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=callback_failed`);
    }
  }
);

// @route   POST /api/auth/google/verify
// @desc    Verify Google OAuth token (for mobile/SPA)
// @access  Public
router.post('/google/verify', async (req, res) => {
  try {
    const { googleToken } = req.body;
    
    if (!googleToken) {
      return res.status(400).json({
        success: false,
        error: 'Google token is required'
      });
    }

    // Verify Google token with Google's API
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`);
    
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    const googleUser = await response.json();
    
    // Find or create user
    let user = await User.findOne({ googleId: googleUser.id });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email: googleUser.email });
      
      if (user) {
        // Link Google account
        user.googleId = googleUser.id;
        user.avatar = googleUser.picture;
        user.authProvider = 'google';
        user.isEmailVerified = true;
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId: googleUser.id,
          username: googleUser.email.split('@')[0],
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          avatar: googleUser.picture,
          role: 'customer',
          isEmailVerified: true,
          authProvider: 'google'
        });
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('❌ Google verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
});

// @route   GET /api/auth/google/status
// @desc    Check Google OAuth configuration
// @access  Public
router.get('/google/status', (req, res) => {
  const configured = isGoogleConfigured();

  res.json({
    success: true,
    configured: configured,
    clientId: configured ? 'Configured ✅' : 'Not configured ❌',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    message: configured
      ? 'Google OAuth is properly configured'
      : 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file'
  });
});

export default router;
