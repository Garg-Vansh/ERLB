import { body } from 'express-validator';

export const createOrderValidator = [
  body('orderItems').isArray({ min: 1 }).withMessage('Order items are required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
];

export const refundValidator = [
  body('reason').notEmpty().withMessage('Refund reason is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Refund amount must be positive')
];
