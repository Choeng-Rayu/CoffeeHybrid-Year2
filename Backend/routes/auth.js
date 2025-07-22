import express from 'express';
import { register, login, registerTelegram, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Register Telegram user
router.post('/register-telegram', registerTelegram);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

export default router;
