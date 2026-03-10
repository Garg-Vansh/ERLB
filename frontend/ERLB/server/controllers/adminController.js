import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import AuditLog from '../models/auditLogModel.js';

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [orderCount, productCount, userCount, salesAgg, pendingRefunds, lowStockProducts, recentAudits] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]),
    Order.countDocuments({ refundStatus: { $in: ['requested', 'processing'] } }),
    Product.find({ countInStock: { $lte: 15 } }).select('name countInStock').limit(10),
    AuditLog.find({}).sort('-createdAt').limit(10)
  ]);

  res.json({
    stats: {
      orderCount,
      productCount,
      userCount,
      totalSales: salesAgg[0]?.totalSales || 0,
      pendingRefunds
    },
    lowStockProducts,
    recentAudits
  });
});

export { getAdminDashboard };
