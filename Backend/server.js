import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';
import HostingManager from './config/hosting.js';
import errorHandler from './middleWare/errorHandler.js';
import { activityLogger, authLogger, systemLogger } from './middleWare/activityLogger.js';
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
import googleAuthRoutes from './routes/googleAuth.js';

dotenv.config();

const hostingManager = new HostingManager();

const app = express();
const PORT = hostingManager.config.port;

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

// Add activity logging middleware
app.use(activityLogger);

app.use(session({
  secret: process.env.SESSION_SECRET || 'coffee_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Coffee Ordering System API is running',
    hosting: hostingManager.hostingType,
    environment: process.env.NODE_ENV || 'development',
    urls: hostingManager.getServerUrls()
  });
});

app.get('/api/hosting/info', (req, res) => {
  res.json(hostingManager.getEnvironmentInfo());
});

// Swagger API Documentation
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
