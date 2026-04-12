import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { rateLimiter } from './lib/rateLimiter';

dotenv.config();

import documentsRoutes from './routes/documents.routes';
import analysesRoutes from './routes/analyses.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(hpp());
app.use(xss());
// CORS for RapidAPI - allow all origins as RapidAPI proxies requests
app.use(cors({
  origin: true,
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request timing middleware
app.use((req, res, next) => {
  (req as any).startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - (req as any).startTime;
    res.setHeader('X-Processing-Time', `${duration}ms`);
  });
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: {
    url: '/openapi.yaml'
  }
}));

// Serve OpenAPI specification
app.use('/openapi.yaml', express.static('openapi.yaml'));

// Global rate limiting - 100 requests per 15 minutes by default
// Key function uses RapidAPI user header if available, falls back to API key/tier from auth, then IP
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyFn: (req) => {
    // Try RapidAPI user header first (for RapidAPI proxy)
    const rapidApiUser = req.headers['x-rapidapi-user'];
    if (rapidApiUser) return String(rapidApiUser);
    
    // Fall back to API key hash and tier from auth middleware
    const apiKeyHash = (req as any).apiKeyHash;
    const tier = (req as any).tier;
    if (apiKeyHash) return `api:${apiKeyHash}:${tier || 'free'}`;
    
    // Fall back to IP address
    return req.ip || req.connection.remoteAddress || 'anon';
  },
  skipOnNoRedis: false // Use memory fallback if Redis unavailable
}));

// API routes
app.use('/v1/documents', documentsRoutes);
app.use('/v1/documents', analysesRoutes);
app.use('/v1/health', healthRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'FinSightIQ API is running',
    version: '1.0.0',
    endpoints: {
      health: '/v1/health',
      upload: '/v1/documents/upload',
      documents: '/v1/documents',
      analyses: '/v1/documents/:document_id/[analysis-type]',
      docs: '/api-docs'
    }
  });
});

// Error handling middleware
app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('API Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  const errorResponse = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  };
  
  res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      available_endpoints: [
        'GET /v1/health',
        'POST /v1/documents/upload',
        'GET /v1/documents/:id',
        'POST /v1/documents/:id/ratios',
        'POST /v1/documents/:id/health-score',
        'POST /v1/documents/:id/creditworthiness',
        'POST /v1/documents/:id/commentary',
        'POST /v1/documents/:id/cashflow',
        'POST /v1/documents/:id/revenue',
        'POST /v1/documents/:id/anomalies'
      ]
    }
  });
});

export default app;
