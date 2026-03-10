import express from 'express';
import {
  calculateShippingQuote,
  getTrackingInfo
} from '../controllers/shippingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/quote', calculateShippingQuote);
router.get('/tracking/:id', protect, getTrackingInfo);

export default router;
