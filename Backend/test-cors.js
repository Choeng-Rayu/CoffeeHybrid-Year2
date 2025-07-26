import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration that includes port 8081
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'https://hybridcoffee.netlify.app',
    'https://coffeehybrid.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CORS test server is running',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'No origin header'
  });
});

app.get('/api/menu', (req, res) => {
  res.json({
    success: true,
    message: 'Menu endpoint working',
    data: [
      { id: 1, name: 'Test Coffee', price: 5.99, category: 'hot' },
      { id: 2, name: 'Test Iced Coffee', price: 6.99, category: 'iced' }
    ],
    origin: req.get('Origin') || 'No origin header'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Test Server running on port ${PORT}`);
  console.log('✅ CORS enabled for:');
  corsOptions.origin.forEach(origin => {
    console.log(`   - ${origin}`);
  });
  console.log(`🔗 Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`   - http://localhost:${PORT}/api/menu`);
  console.log('\n🧪 Test from your frontend at http://localhost:8081');
});
