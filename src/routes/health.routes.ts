import { Router } from 'express';
import { cache } from '../lib/cache';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'FinSightIQ API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      cache: cache.isRedisAvailable() ? 'redis' : 'memory',
      features: {
        document_parsing: true,
        ai_analysis: true,
        ocr_support: true,
        batch_processing: true
      }
    }
  });
});

export default router;
