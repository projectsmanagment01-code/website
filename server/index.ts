import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import mediaRoutes from './routes/media';
import { errorHandler, logErrors, clientErrorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logger';
import { prisma } from '../lib/prisma';

// Import global error handlers
import '../app/error-handlers';

const app = express();
const PORT = process.env.MEDIA_SERVER_PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Allow images to be served
}));

// CORS configuration
app.use(cors({
  origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'media-server',
    database: 'unknown',
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.database = 'connected';
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.database = 'disconnected';
    console.error('[HEALTH_CHECK] Database connection failed:', error);
    return res.status(503).json(healthCheck);
  }

  res.json(healthCheck);
});

// API routes
app.use('/api/media', mediaRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (MUST BE LAST)
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Media server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🖼️  Media API: http://localhost:${PORT}/api/media`);
});

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} signal received: closing HTTP server`);
  
  server.close(async () => {
    console.log('📡 HTTP server closed');
    
    try {
      await prisma.$disconnect();
      console.log('🗄️ Database disconnected');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⏱️ Forcing shutdown after timeout...');
    process.exit(1);
  }, 10000);
}

// Graceful shutdown on various signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
export { app, prisma };
