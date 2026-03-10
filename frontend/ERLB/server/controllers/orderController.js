import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import {
  sendOrderConfirmation,
  sendShippingUpdate
} from '../services/notificationService.js';
import { calculateShipping, generateTracking } from '../services/shippingService.js';
import { writeAuditLog } from '../middleware/auditMiddleware.js';

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentGateway,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const shippingInfo = calculateShipping({
    postalCode: shippingAddress.postalCode,
    itemsPrice
  });

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    paymentGateway: paymentGateway || (paymentMethod === 'Cash On Delivery' ? 'cod' : 'razorpay'),
    shippingMethod: 'Standard',
    shippingZone: shippingInfo.zone,
    courierProvider: shippingInfo.courierProvider,
    itemsPrice,
    taxPrice,
    shippingPrice: shippingPrice ?? shippingInfo.shippingPrice,
    totalPrice
  });

  const createdOrder = await order.save();

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: -item.qty }
    });
  }

  const user = await User.findById(req.user._id);
  if (user) {
    await sendOrderConfirmation({ user, order: createdOrder });
  }

  res.status(201).json(createdOrder);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order || (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paymentStatus = 'paid';
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer?.email_address,
    signature: req.body.signature,
    rawPayload: req.body.rawPayload
  };

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email').sort('-createdAt');
  res.json(orders);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.shippingStatus = 'delivered';

  const updatedOrder = await order.save();

  await writeAuditLog({
    req,
    action: 'ORDER_MARKED_DELIVERED',
    targetType: 'Order',
    targetId: order._id.toString(),
    details: {}
  });

  res.json(updatedOrder);
});

const updateOrderShipping = asyncHandler(async (req, res) => {
  const { shippingStatus } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const tracking = order.trackingId ? null : generateTracking();
  if (tracking) {
    order.trackingId = tracking.trackingId;
    order.trackingUrl = tracking.trackingUrl;
  }

  order.shippingStatus = shippingStatus || order.shippingStatus;
  if (shippingStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  const updated = await order.save();

  if (order.user) {
    await sendShippingUpdate({ user: order.user, order: updated });
  }

  await writeAuditLog({
    req,
    action: 'ORDER_SHIPPING_UPDATED',
    targetType: 'Order',
    targetId: order._id.toString(),
    details: { shippingStatus: order.shippingStatus }
  });

  res.json(updated);
});

const requestRefund = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }

  if (!order.isPaid) {
    res.status(400);
    throw new Error('Only paid orders can be refunded');
  }

  order.refundStatus = 'requested';
  order.refundAmount = Number(req.body.amount);
  order.refundReason = req.body.reason;

  const updated = await order.save();

  await writeAuditLog({
    req,
    action: 'REFUND_REQUESTED',
    targetType: 'Order',
    targetId: order._id.toString(),
    details: { amount: order.refundAmount, reason: order.refundReason }
  });

  res.json(updated);
});

const processRefund = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.refundStatus = req.body.status || 'processing';

  if (order.refundStatus === 'refunded') {
    order.paymentStatus = 'refunded';
  }

  const updated = await order.save();

  await writeAuditLog({
    req,
    action: 'REFUND_UPDATED',
    targetType: 'Order',
    targetId: order._id.toString(),
    details: { status: order.refundStatus }
  });

  res.json(updated);
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  updateOrderShipping,
  requestRefund,
  processRefund
};
