import compression from 'compression';
import helmet from 'helmet';

const setupPerformanceMiddleware = (app) => {
  // Enable gzip compression
  app.use(compression());
  
  // Security headers
  app.use(helmet());
  
  // Cache control
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', 'public, max-age=31557600'); // 1 year
    }
    next();
  });
};

export default setupPerformanceMiddleware;
