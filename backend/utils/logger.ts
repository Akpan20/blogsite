import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let formattedMessage = '';

  if (typeof message === 'object') {
    try {
      formattedMessage = JSON.stringify(message, null, 2);
    } catch {
      formattedMessage = '[Circular Structure]';
    }
  } else {
    formattedMessage = message;
  }

  const metaString = Object.keys(metadata).length 
    ? JSON.stringify(metadata, null, 2)
    : '';

  return `${timestamp} [${level}]: ${formattedMessage} ${metaString}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default {
  info: (message: string | object, meta: Record<string, unknown> = {}) => {
    logger.info({ message, ...meta });
  },
  error: (message: string | object, error?: Error | object) => {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;

    logger.error({
      message,
      error: errorDetails
    });
  },
  warn: (message: string | object, meta: Record<string, unknown> = {}) => {
    logger.warn({ message, ...meta });
  },
  debug: (message: string | object, meta: Record<string, unknown> = {}) => {
    logger.debug({ message, ...meta });
  }
};
