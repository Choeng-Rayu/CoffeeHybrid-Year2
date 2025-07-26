import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';
import HostingManager from './config/hosting.js';
import errorHandler from './middleWare/errorHandler.js';
import { activityLogger, authLogger, systemLogger } from './middleWare/activityLogger.js';
import { securityHeaders, generalRateLimit, securityLogger } from './middleWare/security.js';
import { sanitizeInput } from './middleWare/validation.js';
import { performanceMonitor, getHealthMetrics, startPerformanceLogging } from './middleWare/performance.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.js';

// Import Sequelize instance
import  sequelize  from './models/index.js';  // adjust path if needed

// Import routes
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import adminRoutes from './routes/admin.js';
import superAdminRoutes from './routes/superAdmin.js';
import googleAuthRoutes from './routes/googleAuth.js';

dotenv.config();

const hostingManager = new HostingManager();

const app = express();
const PORT = hostingManager.config.port;

const hostingConfig = hostingManager.getEnvironmentInfo();
console.log('🌐 Hosting Configuration:', hostingConfig);

// Define CORS options once
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'https://hybridcoffee.netlify.app',
    'https://coffeehybrid.onrender.com',
    ...hostingManager.config.corsOrigins
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Security middleware (should be first)
app.use(securityHeaders);
app.use(performanceMonitor);
app.use(securityLogger);
app.use(generalRateLimit);

// Apply CORS middleware
app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Add activity logging middleware
app.use(activityLogger);

// Ensure SESSION_SECRET is set
if (!process.env.SESSION_SECRET) {
  console.error('⚠️  SESSION_SECRET is not set in environment variables');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // CSRF protection
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Swagger
const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Coffee Hybrid API Documentation"
}));

// Add auth-specific logging for auth routes
app.use('/api/auth', authLogger);
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.get('/api/health', (req, res) => {
  const healthMetrics = getHealthMetrics();
  res.json({
    ...healthMetrics,
    message: 'Coffee Ordering System API is running',
    hosting: hostingManager.hostingType,
    environment: process.env.NODE_ENV || 'development',
    urls: hostingManager.getServerUrls()
  });
});

app.get('/api/hosting/info', (req, res) => {
  res.json(hostingManager.getEnvironmentInfo());
});

// Swagger setup is already done above - removing duplicate

app.use(errorHandler);

const startServer = async () => {
  try {
    // Log server startup
    systemLogger.logEvent('SERVER_STARTUP', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      hostingType: hostingManager.hostingType
    });

    // Connect to SQL DB with Sequelize instead of Mongo
    await sequelize.authenticate();
    console.log('✅ Connected to SQL database');
    systemLogger.logEvent('DATABASE_CONNECTED', { type: 'SQL', status: 'success' });

    await sequelize.sync({ force: false });  // sync models to DB
    console.log('✅ Sequelize models synced');
    systemLogger.logEvent('DATABASE_SYNCED', { status: 'success' });

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

      // Start performance monitoring
      startPerformanceLogging();

      systemLogger.logEvent('SERVER_READY', {
        port: PORT,
        urls: urls,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    systemLogger.logEvent('SERVER_STARTUP_FAILED', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();

export default app;
