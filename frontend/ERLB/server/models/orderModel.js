import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        }
      }
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod'],
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      signature: String,
      rawPayload: Object
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processing', 'refunded', 'failed'],
      default: 'none'
    },
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    shippingMethod: { type: String, default: 'Standard' },
    shippingZone: { type: String, default: 'Zone-B' },
    courierProvider: { type: String, default: 'ERLB Logistics' },
    trackingId: { type: String },
    trackingUrl: { type: String },
    shippingStatus: {
      type: String,
      enum: ['pending', 'packed', 'shipped', 'in_transit', 'delivered'],
      default: 'pending'
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: Date
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
