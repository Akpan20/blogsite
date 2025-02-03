import type { Request, Response } from 'express';
import logger from '../utils/logger.ts';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  logger.error('Unhandled error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(!isProduction && {
      error: err.message,
      stack: err.stack
    })
  });
};