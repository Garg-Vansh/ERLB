import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { updateProductValidator } from '../validators/productValidators.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/categories', getProductCategories);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProductValidator, validate, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
