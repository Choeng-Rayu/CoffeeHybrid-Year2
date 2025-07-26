import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001; // Different port to avoid conflicts

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('   Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', req.body);
  }
  next();
});

// Catch all routes to see what the frontend is actually sending
app.all('*', (req, res) => {
  console.log(`🎯 Caught request: ${req.method} ${req.url}`);
  res.json({
    message: 'Request received',
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
});

app.listen(PORT, () => {
  console.log(`🔍 Debug server running on port ${PORT}`);
  console.log('This server will log all requests from your frontend');
  console.log('');
  console.log('To test:');
  console.log('1. Update your frontend API base URL to http://localhost:3001');
  console.log('2. Try to register/login');
  console.log('3. Check the logs here to see what requests are being made');
});
