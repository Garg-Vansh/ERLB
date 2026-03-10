import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import {
  createGatewayOrder,
  paymentConfig,
  verifyRazorpaySignature,
  verifyRazorpayWebhook,
  verifyStripeWebhook
} from '../services/paymentService.js';
import { writeAuditLog } from '../middleware/auditMiddleware.js';

const getPaymentConfig = asyncHandler(async (req, res) => {
  res.json(paymentConfig());
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order already paid');
  }

  const gatewayOrder = await createGatewayOrder({
    orderId: order._id.toString(),
    amount: order.totalPrice
  });

  order.paymentGateway = gatewayOrder.provider;
  order.paymentStatus = 'authorized';
  order.paymentResult = {
    ...order.paymentResult,
    id: gatewayOrder.id,
    status: 'created'
  };

  await order.save();

  res.json(gatewayOrder);
});

const confirmRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpay_order_id: gatewayOrderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature
  } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }

  const verified = verifyRazorpaySignature({
    orderId: gatewayOrderId,
    paymentId,
    signature
  });

  if (!verified) {
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  order.isPaid = true;
  order.paymentStatus = 'paid';
  order.paidAt = new Date();
  order.paymentResult = {
    id: paymentId,
    status: 'captured',
    signature,
    rawPayload: req.body
  };

  await order.save();

  await writeAuditLog({
    req,
    action: 'PAYMENT_CONFIRMED',
    targetType: 'Order',
    targetId: order._id.toString(),
    details: { paymentId }
  });

  res.json({ message: 'Payment verified and order marked paid' });
});

const paymentWebhookHandler = asyncHandler(async (req, res) => {
  const provider = process.env.PAYMENT_PROVIDER || 'razorpay';

  if (provider === 'stripe') {
    const event = verifyStripeWebhook(req.body, req.headers['stripe-signature']);

    if (!event) {
      res.status(400);
      throw new Error('Stripe webhook verification failed');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paymentStatus = 'paid';
          order.paidAt = new Date();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            rawPayload: paymentIntent
          };
          await order.save();
        }
      }
    }

    res.json({ received: true });
    return;
  }

  const rawBody = req.body.toString();
  const signature = req.headers['x-razorpay-signature'];
  const verified = verifyRazorpayWebhook(rawBody, signature);

  if (!verified) {
    res.status(400);
    throw new Error('Invalid Razorpay webhook signature');
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  if (event === 'payment.captured') {
    const paymentEntity = payload.payload?.payment?.entity;
    const orderReceipt = paymentEntity?.notes?.orderId || paymentEntity?.notes?.order_id;

    if (orderReceipt) {
      const order = await Order.findById(orderReceipt);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        order.paymentResult = {
          id: paymentEntity.id,
          status: paymentEntity.status,
          rawPayload: paymentEntity
        };
        await order.save();
      }
    }
  }

  res.json({ received: true });
});

export {
  getPaymentConfig,
  createPaymentOrder,
  confirmRazorpayPayment,
  paymentWebhookHandler
};
