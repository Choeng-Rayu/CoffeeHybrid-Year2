// Script to insert 5 admin users into the database
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

export async function insertAdminUsers() {
  const admins = [
    {
      username: 'admin1',
      email: 'admin1@coffeehybrid.com',
      password: 'adminpass1',
      firstName: 'Admin',
      lastName: 'One',
    },
    {
      username: 'admin2',
      email: 'admin2@coffeehybrid.com',
      password: 'adminpass2',
      firstName: 'Admin',
      lastName: 'Two',
    },
    {
      username: 'admin3',
      email: 'admin3@coffeehybrid.com',
      password: 'adminpass3',
      firstName: 'Admin',
      lastName: 'Three',
    },
    {
      username: 'admin4',
      email: 'admin4@coffeehybrid.com',
      password: 'adminpass4',
      firstName: 'Admin',
      lastName: 'Four',
    },
    {
      username: 'admin5',
      email: 'admin5@coffeehybrid.com',
      password: 'adminpass5',
      firstName: 'Admin',
      lastName: 'Five',
    },
  ];

  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, 10);
    await User.findOrCreate({
      where: { email: admin.email },
      defaults: {
        ...admin,
        password: hash,
        role: 'admin',
        isEmailVerified: true,
      },
    });
  }
  console.log('✅ 5 admin users inserted (if not already present)');
}
