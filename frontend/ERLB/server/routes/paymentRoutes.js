import express from 'express';
import {
  getPaymentConfig,
  createPaymentOrder,
  confirmRazorpayPayment,
  paymentWebhookHandler
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { createPaymentOrderValidator } from '../validators/paymentValidators.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createPaymentOrderValidator, validate, createPaymentOrder);
router.post('/confirm', protect, confirmRazorpayPayment);
router.post('/webhook', paymentWebhookHandler);

export default router;
