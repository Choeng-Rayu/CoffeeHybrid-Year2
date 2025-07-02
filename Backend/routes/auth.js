import express from 'express';
import { register, login, registerTelegram } from '../controllers/authController.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Register Telegram user
router.post('/register-telegram', registerTelegram);

export default router;
