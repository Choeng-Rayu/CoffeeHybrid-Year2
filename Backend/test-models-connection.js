import dotenv from 'dotenv';
import sequelize from './models/index.js';

dotenv.config();

console.log('🔄 Testing database connection from models/index.js...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

async function testConnection() {
    try {
        console.log('\n🔄 Attempting to connect to Aiven MySQL database...');
        
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully!');
        
        // Test a simple query
        const [results] = await sequelize.query('SELECT VERSION() as version');
        console.log('📊 MySQL Version:', results[0].version);
        
        console.log('✅ Database connection is working correctly!');
        
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        console.error('Full error:', error);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Connection closed.');
    }
}

testConnection();
