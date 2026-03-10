import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many auth attempts. Please wait before retrying.'
  }
});

const applySecurity = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(compression());
  app.use(mongoSanitize());
  app.use(hpp());
  app.use('/api', apiLimiter);
  app.use('/api/users/login', authLimiter);
  app.use('/api/users/forgot-password', authLimiter);
};

export { applySecurity };
