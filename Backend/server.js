import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';

// Import routes
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import googleAuthRoutes from './routes/googleAuth.js';

// Import hosting configuration
import HostingManager from './config/hosting.js';

dotenv.config();

// Initialize hosting manager
const hostingManager = new HostingManager();

const app = express();
const PORT = hostingManager.config.port;

// Get hosting configuration
const hostingConfig = hostingManager.getEnvironmentInfo();
console.log('🌐 Hosting Configuration:', hostingConfig);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://hybridcoffee.netlify.app',
    'https://coffeehybrid.onrender.com',
    ...hostingManager.config.corsOrigins
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'coffee_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes); // Google OAuth routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Coffee Ordering System API is running',
    hosting: hostingManager.hostingType,
    environment: process.env.NODE_ENV || 'development',
    urls: hostingManager.getServerUrls()
  });
});

// Hosting info endpoint
app.get('/api/hosting/info', (req, res) => {
  res.json(hostingManager.getEnvironmentInfo());
});

// MongoDB connection and server startup
const startServer = async () => {
  try {
    // ngrok setup disabled - keeping for future use
    // if (hostingManager.hostingType === 'ngrok' && hostingManager.config.requiresSetup) {
    //   try {
    //     console.log('🔧 Setting up ngrok tunnel...');
    //     await hostingManager.setupNgrok();
    //   } catch (error) {
    //     console.warn('⚠️  ngrok setup failed:', error.message);
    //     console.log('💡 Continuing with local development...');
    //   }
    // }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      const urls = hostingManager.getServerUrls();
      console.log('\n🚀 CoffeeHybrid Server Started Successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Hosting Type: ${hostingManager.hostingType.toUpperCase()}`);
      console.log(`🌐 Server URL: ${urls.base}`);
      console.log(`🔗 API Base: ${urls.api}`);
      console.log(`❤️  Health Check: ${urls.health}`);
      console.log(`🔐 Google OAuth: ${urls.googleAuth}`);
      console.log(`📱 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

      if (hostingManager.hostingType === 'local') {
        console.log('💻 Running in local development mode');
        console.log('🔧 For global access, consider using ngrok (files available)');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('☕ Ready to serve coffee orders! ☕');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
