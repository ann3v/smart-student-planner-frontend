import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { sequelize } from './src/models';

// Load environment variables
dotenv.config();

// ==================== STARTUP VALIDATION ====================

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.includes('CHANGE_ME')) {
  console.error('❌ FATAL: JWT_SECRET is missing or still set to placeholder.');
  console.error('   Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

// Import routes
import authRoutes from './src/routes/authRoutes';
import taskRoutes from './src/routes/taskRoutes';
import subjectRoutes from './src/routes/subjectRoutes';
import scheduleRoutes from './src/routes/scheduleRoutes';
import analyticsRoutes from './src/routes/analyticsRoutes';

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : (process.env.NODE_ENV === 'production'
      ? ['https://yourapp.com']
      : ['*']);

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiter
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

// Auth-specific rate limiter
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

// Stricter rate limiter for verification
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

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Smart Student Planner API',
    version: '1.0.0',
  });
});

app.get('/health/db', async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

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
        tables: (results as Array<{ table_name: string }>).map(r => r.table_name),
        timestamp: new Date().toISOString(),
        databaseName: process.env.DB_NAME,
        host: process.env.DB_HOST,
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'ERROR',
      database: 'Connection failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/api', (_req: Request, res: Response) => {
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

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-code', verificationLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);

// ==================== ERROR HANDLING ====================

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('Server Error:', err.stack);

  const statusCode = 500;
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

// ==================== DATABASE SETUP ====================

async function setupDatabase(): Promise<boolean> {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const [tables] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const usersTableExists = (tables as Array<{ exists: boolean }>)[0].exists;

    if (!usersTableExists) {
      console.log('📦 Creating database tables...');
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: false, alter: true });
      } else {
        await sequelize.sync({ force: false });
      }
      console.log('✅ Database tables created successfully.');
    } else {
      console.log('✅ Database tables already exist.');
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Database schema updated if needed.');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', (error as Error).message);
    return false;
  }
}

// ==================== SERVER STARTUP ====================

const PORT = Number(process.env.PORT || 5000);

async function startServer(): Promise<void> {
  try {
    const dbReady = await setupDatabase();
    if (!dbReady) {
      console.error('❌ Database setup failed. Exiting...');
      process.exit(1);
    }

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
    console.error('❌ Failed to start server:', (error as Error).message);
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify .env file configuration');
    console.error('3. Check database credentials');
    console.error('4. Ensure port 5000 is not in use');
    process.exit(1);
  }
}

startServer();
