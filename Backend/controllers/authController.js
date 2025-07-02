// Controller for authentication-related logic
import { User } from '../models/index.js';
import { Op } from 'sequelize';

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
