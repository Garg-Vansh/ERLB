import express from 'express';
import { getMetrics } from '../controllers/monitoringController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/metrics', protect, admin, getMetrics);

export default router;
