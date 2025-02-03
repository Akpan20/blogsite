import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.ts';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Request received:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
};