import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  updateOrderShipping,
  requestRefund,
  processRefund
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createOrderValidator, refundValidator } from '../validators/orderValidators.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrderValidator, validate, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/shipping').put(protect, admin, updateOrderShipping);
router.route('/:id/refund').post(protect, refundValidator, validate, requestRefund).put(protect, admin, processRefund);

export default router;
