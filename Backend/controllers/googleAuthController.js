// Controller for Google OAuth-related logic
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { Op } from 'sequelize';

const isGoogleConfigured = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret && clientId !== 'your_google_client_id_here' && clientSecret !== 'your_google_client_secret_here' && clientId.length > 10 && clientSecret.length > 10;
};

export const googleAuth = (req, res, next) => {
  console.log('🔐 Google OAuth initiated:', {
    configured: isGoogleConfigured(),
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  });

  if (!isGoogleConfigured()) {
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.me')
      : (process.env.CLIENT_URL || 'http://localhost:5173');
    console.log('❌ Google OAuth not configured, redirecting to:', `${frontendUrl}/login?error=oauth_not_configured`);
    return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleCallback = [
  (req, res, next) => {
    if (!isGoogleConfigured()) {
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee-za9sy.ondigitalocean.app')
        : (process.env.CLIENT_URL || 'http://localhost:5173');
      return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
    }
    passport.authenticate('google', {
      failureRedirect: (process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.me')
        : (process.env.CLIENT_URL || 'http://localhost:5173')) + '/login?error=oauth_failed',
      session: false
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('✅ Google OAuth callback successful, processing user:', req.user?.email);

      const user = req.user;
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      };
      let frontendUrl;
      if (process.env.NODE_ENV === 'production') {
        frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://hybridcoffee.me';
      } else {
        frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      }
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;

      console.log('🔄 Redirecting to frontend callback:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const fallbackUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=callback_failed`;
      console.log('🔄 Redirecting to error page:', fallbackUrl);
      res.redirect(fallbackUrl);
    }
  }
];

export const googleVerify = async (req, res, next) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ success: false, error: 'Google token is required' });
    }
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`);
    if (!response.ok) {
      return res.status(400).json({ success: false, error: 'Invalid Google token' });
    }
    const googleUser = await response.json();
    let user = await User.findOne({ where: { googleId: googleUser.id } });
    if (!user) {
      user = await User.findOne({ where: { email: googleUser.email } });
      if (user) {
        user.googleId = googleUser.id;
        user.avatar = googleUser.picture;
        user.authProvider = 'google';
        user.isEmailVerified = true;
        await user.save();
      } else {
        user = await User.create({
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
      }
    }
    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
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
    res.status(500).json({ success: false, error: 'Google authentication failed' });
  }
};

export const googleStatus = (req, res) => {
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
};

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     tags: [GoogleAuth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [GoogleAuth]
 *     responses:
 *       302:
 *         description: Redirects to frontend with authentication result
 */
