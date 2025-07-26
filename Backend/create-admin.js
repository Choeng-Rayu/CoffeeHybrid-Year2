import { User } from './models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Creating Super Admin User...\n');

const adminData = {
  username: 'superadmin',
  email: 'admin@coffeehybrid.com',
  password: 'admin123456',
  role: 'admin',
  firstName: 'Super',
  lastName: 'Admin',
  authProvider: 'local',
  isEmailVerified: true
};

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        [Op.or]: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n💡 You can use these credentials to login:');
      console.log(`   Username/Email: ${existingAdmin.username} or ${existingAdmin.email}`);
      console.log(`   Password: admin123456 (if you haven't changed it)`);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const admin = await User.create({
      ...adminData,
      password: hashedPassword
    });

    console.log('🎉 Super Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log(`   Username/Email: ${admin.username} or ${admin.email}`);
    console.log(`   Password: ${adminData.password}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Go to your frontend: http://localhost:8081');
    console.log('   2. Login with the credentials above');
    console.log('   3. Navigate to Super Admin Dashboard: http://localhost:8081/super-admin');
    console.log('   4. Start managing your coffee ordering system!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
  }
}

createAdmin().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
