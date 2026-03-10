import asyncHandler from 'express-async-handler';
import { getSystemMetrics } from '../services/monitoringService.js';

const getMetrics = asyncHandler(async (req, res) => {
  res.json(getSystemMetrics());
});

export { getMetrics };
