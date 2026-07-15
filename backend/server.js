const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { sequelize } = require('./src/models');

// Load environment variables
dotenv.config();

// ==================== STARTUP VALIDATION ====================

// Fail fast if critical secrets are missing or still placeholders
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.includes('CHANGE_ME')) {
  console.error('❌ FATAL: JWT_SECRET is missing or still set to placeholder.');
  console.error('   Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Trust proxy — needed when running behind a reverse proxy (nginx, load balancer)
// so that req.ip and X-Forwarded-* headers are correctly handled by rate limiter
app.set('trust proxy', 1);

// Helmet: Secure HTTP headers (X-Frame-Options, X-XSS-Protection, CSP, etc.)
app.use(helmet());

// CORS: Restrict origins in production, allow all in development
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : (process.env.NODE_ENV === 'production'
      ? ['https://yourapp.com']
      : ['*']);

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? function (origin, callback) {
        // allow requests with no origin (mobile apps, curl)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400,
}));

// Request size limits (prevents oversized payload attacks)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiter: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', globalLimiter);

// Auth-specific rate limiter: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many attempts, please try again after 15 minutes',
  },
});

// Stricter rate limiter for verification: 5 attempts per 15 minutes per IP
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many verification attempts',
    message: 'Too many code verification attempts, please try again after 15 minutes',
  },
});

// ==================== HEALTH CHECK ROUTES ====================

const SERVER_HOST = process.env.SERVER_HOST || 'localhost';

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Smart Student Planner API',
    version: '1.0.0',
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // Do not expose database table names in production
    if (process.env.NODE_ENV === 'production') {
      res.json({
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.json({
        status: 'OK',
        database: 'Connected',
        tables: results.map(r => r.table_name),
        timestamp: new Date().toISOString(),
        databaseName: process.env.DB_NAME,
        host: process.env.DB_HOST,
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    // Do not expose error details in production
    res.status(500).json({
      status: 'ERROR',
      database: 'Connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Smart Student Planner API',
    version: '1.0.0',
    description: 'Backend API for Smart Student Planner mobile application',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      subjects: '/api/subjects',
      schedule: '/api/schedule',
      analytics: '/api/analytics',
    },
  });
});

// ==================== API ROUTES ====================

// Auth routes with login rate limiting and verification code rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-code', verificationLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    error: message,
    status: 'error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==================== DATABASE SETUP (NO TEST USERS) ====================

async function setupDatabase() {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Check if users table exists
    const [tables] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const usersTableExists = tables[0].exists;

    if (!usersTableExists) {
      console.log('📦 Creating database tables...');
      // Sync all models - only in development
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: false, alter: true });
      } else {
        // In production, rely on migrations only
        await sequelize.sync({ force: false });
      }
      console.log('✅ Database tables created successfully.');
    } else {
      console.log('✅ Database tables already exist.');
      // In development, update schema if needed. In production, do nothing auto.
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Database schema updated if needed.');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
}

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Setup database first
    const dbReady = await setupDatabase();
    if (!dbReady) {
      console.error('❌ Database setup failed. Exiting...');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 =======================================================
✅ Server is running!
📡 PORT: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔒 Security: Helmet + Rate Limiting enabled
🗄️  Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}
📅 Started at: ${new Date().toLocaleString()}
🚀 =======================================================

📋 Available Endpoints:
📡 Health Check:     http://${SERVER_HOST}:${PORT}/health
🔧 Database Check:   http://${SERVER_HOST}:${PORT}/health/db
📚 API Documentation: http://${SERVER_HOST}:${PORT}/api
======================================================= 🚀
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify .env file configuration');
    console.error('3. Check database credentials');
    console.error('4. Ensure port 5000 is not in use');
    process.exit(1);
  }
}

// Start the server
startServer();