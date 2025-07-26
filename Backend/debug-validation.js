import express from 'express';
import cors from 'cors';
import { validateRegistration } from './middleWare/validation.js';

const app = express();
const PORT = 3002;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Test validation endpoint
app.post('/test-validation', validateRegistration, (req, res) => {
  console.log('✅ Validation passed!');
  res.json({
    success: true,
    message: 'Validation successful',
    receivedData: req.body
  });
});

// Test endpoint without validation
app.post('/test-no-validation', (req, res) => {
  console.log('📝 Raw data received:', req.body);
  res.json({
    success: true,
    message: 'Data received without validation',
    receivedData: req.body
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err
  });
});

app.listen(PORT, () => {
  console.log(`🔍 Validation Debug Server running on port ${PORT}`);
  console.log('\nTest endpoints:');
  console.log(`- POST http://localhost:${PORT}/test-validation (with validation)`);
  console.log(`- POST http://localhost:${PORT}/test-no-validation (without validation)`);
  console.log('\nTo test from your frontend, temporarily change the API base URL to:');
  console.log(`http://localhost:${PORT}`);
  console.log('\nThen try to register and see what data is being sent.');
});
