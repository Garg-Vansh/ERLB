import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { calculateShipping } from '../services/shippingService.js';

const calculateShippingQuote = asyncHandler(async (req, res) => {
  const quote = calculateShipping({
    postalCode: req.body.postalCode,
    itemsPrice: Number(req.body.itemsPrice || 0)
  });

  res.json(quote);
});

const getTrackingInfo = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }

  res.json({
    trackingId: order.trackingId,
    trackingUrl: order.trackingUrl,
    shippingStatus: order.shippingStatus,
    courierProvider: order.courierProvider
  });
});

export { calculateShippingQuote, getTrackingInfo };
