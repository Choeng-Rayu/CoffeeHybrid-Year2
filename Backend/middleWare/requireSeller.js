// Middleware to check if user is seller or admin
import { User } from '../models/index.js';

export const requireSeller = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Seller privileges required.' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
