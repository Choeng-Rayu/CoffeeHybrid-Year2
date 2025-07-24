import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('Testing Aiven Database Connection...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

// Read the SSL certificate file
const sslCert = fs.readFileSync(path.join(__dirname, 'ca.pem'));

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 23075,
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                ca: sslCert,
                rejectUnauthorized: true
            }
        },
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

async function testConnection() {
    try {
        console.log('\n🔄 Attempting to connect to Aiven MySQL database...');
        
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully!');
        
        // Test a simple query
        const [results] = await sequelize.query('SELECT VERSION() as version');
        console.log('📊 MySQL Version:', results[0].version);
        
        // List databases
        const [databases] = await sequelize.query('SHOW DATABASES');
        console.log('📁 Available databases:', databases.map(db => Object.values(db)[0]));
        
        // Check if our database exists
        const [tables] = await sequelize.query(`SHOW TABLES FROM ${process.env.DB_NAME}`);
        console.log(`📋 Tables in ${process.env.DB_NAME}:`, tables.length > 0 ? tables.map(table => Object.values(table)[0]) : 'No tables found');
        
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        
        if (error.errno) {
            console.error('Error Number:', error.errno);
        }
        
        // Common error solutions
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n💡 Solution: Check if the hostname is correct');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Solution: Check if the port is correct and the server is running');
        } else if (error.message.includes('Access denied')) {
            console.log('\n💡 Solution: Check your username and password');
        } else if (error.message.includes('SSL')) {
            console.log('\n💡 Solution: Check SSL certificate configuration');
        }
    } finally {
        await sequelize.close();
        console.log('\n🔒 Connection closed.');
    }
}

testConnection();
