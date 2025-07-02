import { insertAdminUsers } from './insert-admins.js';
import { sequelize } from '../models/index.js';

(async () => {
  try {
    await sequelize.authenticate();
    await insertAdminUsers();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to insert admin users:', err);
    process.exit(1);
  }
})();
