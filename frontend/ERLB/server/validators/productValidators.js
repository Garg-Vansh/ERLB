import { body } from 'express-validator';

export const updateProductValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 1 }).withMessage('Price must be >= 1'),
  body('countInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be >= 0'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty')
];
