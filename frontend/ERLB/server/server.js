import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { fileURLToPath } from 'url';
import { applySecurity } from './middleware/securityMiddleware.js';
import { logger } from './utils/logger.js';

dotenv.config();
connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

applySecurity(app);
app.use(cookieParser());

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ message: 'ERLB API is running', env: process.env.NODE_ENV || 'development' });
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/monitoring', monitoringRoutes);

if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientPath = path.join(__dirname, '../client/dist');

  app.use(
    express.static(clientPath, {
      maxAge: '7d',
      setHeaders: (res, resourcePath) => {
        if (resourcePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    })
  );

  app.get('*', (req, res) => res.sendFile(path.resolve(clientPath, 'index.html')));
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
