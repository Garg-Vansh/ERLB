import crypto from 'crypto';
import Razorpay from 'razorpay';
import Stripe from 'stripe';

const paymentProvider = process.env.PAYMENT_PROVIDER || 'razorpay';

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const createGatewayOrder = async ({ orderId, amount, currency = 'INR' }) => {
  if (paymentProvider === 'stripe' && stripe) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: { orderId }
    });

    return {
      provider: 'stripe',
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    };
  }

  if (!razorpay) {
    throw new Error('Razorpay is not configured');
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: `order_${orderId}`,
    notes: { orderId }
  });

  return {
    provider: 'razorpay',
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID
  };
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expected === signature;
};

export const verifyRazorpayWebhook = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature;
};

export const verifyStripeWebhook = (rawBody, signature) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return null;

  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

export const paymentConfig = () => ({
  provider: paymentProvider,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || null
});
