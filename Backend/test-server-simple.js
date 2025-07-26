import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const startServer = async () => {
  try {
    console.log('🚀 Starting simple test server...');
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`✅ Test server running on port ${PORT}`);
      console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
