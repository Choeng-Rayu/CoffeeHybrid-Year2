import express from 'express';
import { googleAuth, googleCallback, googleVerify, googleStatus } from '../controllers/googleAuthController.js';

const router = express.Router();

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', ...googleCallback);

// @route   POST /api/auth/google/verify
// @desc    Verify Google OAuth token (for mobile/SPA)
// @access  Public
router.post('/google/verify', googleVerify);

// @route   GET /api/auth/google/status
// @desc    Check Google OAuth configuration
// @access  Public
router.get('/google/status', googleStatus);

export default router;
