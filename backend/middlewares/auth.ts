import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.ts';

// Type definitions
interface UserPayload {
  id: string;
  email: string;
  role: string;
}

interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request type
interface AuthRequest extends Request {
  user?: UserPayload;
}

// Ensure JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    // Get user from database
    prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true
      }
    }).then(user => {
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found' 
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
    }).catch(error => {
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        error: 'Authentication failed' 
      });
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed' 
    });
  }
};
