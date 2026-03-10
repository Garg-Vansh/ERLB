import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUserAdmin
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  registerValidator,
  loginValidator,
  profileUpdateValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/userValidators.js';

const router = express.Router();

router.post('/login', loginValidator, validate, authUser);
router.post('/', registerValidator, validate, registerUser);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, profileUpdateValidator, validate, updateUserProfile);

router.route('/').get(protect, admin, getUsers);
router.route('/:id/role').put(protect, admin, updateUserAdmin);

export default router;
