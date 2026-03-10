import { body } from 'express-validator';

export const createPaymentOrderValidator = [
  body('orderId').notEmpty().withMessage('Order id is required')
];
