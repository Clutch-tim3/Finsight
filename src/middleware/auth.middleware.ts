import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-rapidapi-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'API key is required. Please provide your X-RapidAPI-Key header.'
      }
    });
  }
  
  // Hash the API key for storage and comparison
  const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  // Attach to request for use in other middleware
  (req as any).apiKey = apiKey;
  (req as any).apiKeyHash = apiKeyHash;
  
  // For demo purposes, allow all valid-looking keys in development
  if (process.env.NODE_ENV === 'development' && apiKey.length >= 10) {
    (req as any).tier = 'LENDER'; // Grant full access for demo
    return next();
  }
  
  // In production, verify API key against a database
  // For now, return 401 in production without valid key
  if (process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key. Please check your credentials.'
      }
    });
  }
  
  next();
};
