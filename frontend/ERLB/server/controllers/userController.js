import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../services/notificationService.js';
import { writeAuditLog } from '../middleware/auditMiddleware.js';

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
    token: generateToken(user._id)
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    isAdmin: updatedUser.isAdmin,
    token: generateToken(updatedUser._id)
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.json({ message: 'If that email exists, a reset link has been sent.' });
    return;
  }

  const rawToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail({ email: user.email, token: rawToken, resetLink });

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json(users);
});

const updateUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isAdmin = Boolean(req.body.isAdmin);
  await user.save();

  await writeAuditLog({
    req,
    action: 'USER_ROLE_UPDATED',
    targetType: 'User',
    targetId: user._id.toString(),
    details: { isAdmin: user.isAdmin }
  });

  res.json({ message: 'User role updated' });
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUserAdmin
};
