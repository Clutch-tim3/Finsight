import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';

const WINDOW_SIZE_IN_HOURS = 1;
const REQUESTS_PER_WINDOW = {
  'FREE': 20,
  'STARTER': 300,
  'PRO': 2000,
  'LENDER': 20000,
  'ENTERPRISE': Infinity
};

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKeyHash = (req as any).apiKeyHash;
    const tier = (req as any).tier || 'FREE';
    const endpoint = req.path;
    
    const windowStart = new Date(Date.now() - WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000);
    const cacheKey = `rate_limit:${apiKeyHash}:${windowStart.toISOString().split('T')[0]}`;
    
    let requestsCount = await redis.get(cacheKey);
    
    if (!requestsCount) {
      requestsCount = '0';
    }
    
    const maxRequests = REQUESTS_PER_WINDOW[tier];
    
    if (parseInt(requestsCount) >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded for ${tier} tier. Please upgrade your plan.`,
          retry_after: WINDOW_SIZE_IN_HOURS * 3600
        }
      });
    }
    
    await redis.incr(cacheKey);
    await redis.expire(cacheKey, WINDOW_SIZE_IN_HOURS * 60 * 60);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - parseInt(requestsCount) - 1);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000).toUTCString());
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(); // Fall through to allow request if rate limiting fails
  }
};
