import app from './app';
import prisma from './config/database';
import { cache } from './lib/cache';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`FinSightIQ API is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/v1/health`);
      console.log(`Documentation: http://localhost:${PORT}/api-docs`);
    });
    
    // Log Redis status on startup without crashing
    setTimeout(async () => {
      const r = cache.isRedisAvailable();
      console.log(`[startup] Cache: ${r ? 'Redis' : 'in-memory fallback'}`);
    }, 2000);
    
    // Handle graceful shutdown
    const handleShutdown = async () => {
      console.log('Shutting down FinSightIQ API...');
      
      await prisma.$disconnect();
      // Redis connection is handled lazily via cache module, no need to quit
      
      process.exit(0);
    };
    
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Validate required environment variables at startup
const REQUIRED_ENV = (() => {
  // List the env vars your API actually NEEDS to function
  // (not Redis — that's optional now)
  const required: string[] = [];

  // Uncomment the ones that apply to THIS specific API:
  if (!process.env.ANTHROPIC_API_KEY) required.push('ANTHROPIC_API_KEY');
  // if (!process.env.SHODAN_API_KEY)    required.push('SHODAN_API_KEY');
  // if (!process.env.NVD_API_KEY)       required.push('NVD_API_KEY');
  // etc.

  return required;
})();

const missing = REQUIRED_ENV.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missing.join(', ')}`);
  // Don't crash — log it and continue so health check still responds
}

startServer();
