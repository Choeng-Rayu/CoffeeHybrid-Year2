// Controller for authentication-related logic
import { User } from '../models/index.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }
    const user = await User.create({ username, email, password });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Account is temporarily blocked due to no-shows' });
    }
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        loyaltyPoints: user.loyaltyPoints,
        strikes: user.strikes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const registerTelegram = async (req, res, next) => {
  try {
    const { telegramId, username, firstName, lastName, phoneNumber } = req.body;
    let existingUser = await User.findOne({ where: { telegramId } });
    if (existingUser) {
      return res.json({
        message: 'User already registered',
        user: { id: existingUser.id, username: existingUser.username, telegramId: existingUser.telegramId }
      });
    }
    const user = await User.create({
      username: username || `telegram_${telegramId}`,
      email: `telegram_${telegramId}@temp.com`,
      password: `temp_${telegramId}`,
      telegramId,
      phoneNumber
    });
    res.status(201).json({
      message: 'Telegram user registered successfully',
      user: { id: user.id, username: user.username, telegramId: user.telegramId }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'Email not found in our system' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 1000); // 60 seconds from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken, user.username);

    res.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};
