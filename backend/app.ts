import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import favicon from 'serve-favicon';

// Route imports
import indexRouter from './routes/index.ts';
import authRouter from './routes/auth.ts';
import profileRouter from './routes/profile.ts';
import postRoutes from './routes/post.ts';
import commentRoutes from './routes/comment.ts';
import socialRoutes from './routes/social.ts';
import cdnRoutes from './routes/cdn.ts';
import subscriptionRoutes from './routes/subscription.ts';
import analyticRoutes from './routes/analytic.ts';

const app = express();

// Set Pug as the view engine
app.set('view engine', 'pug');

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true
}));

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Essential middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// API routes under /api prefix
app.use('/api', [
  indexRouter,
  authRouter,
  profileRouter,
  postRoutes,
  commentRoutes,
  socialRoutes,
  cdnRoutes,
  subscriptionRoutes,
  analyticRoutes
]);

// Client-side routing for SPA (should come after API routes)
app.use(express.static(path.join(__dirname, 'client-build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-build', 'index.html'));
});

// Error handling (modified)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

export default app;
