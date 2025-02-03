import logger from './logger.ts';

const monitorPerformance = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      duration,
      status: res.statusCode
    });
  });
  next();
};

export default monitorPerformance;
