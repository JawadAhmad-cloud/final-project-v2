const orderModel = require("../model/order.model");
const shopModel = require("../model/shop.model");
const userModel = require("../model/user.model");
const paymentModel = require("../model/payment.model");

/**
 * Get Platform-wide Analytics Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Analytics period (day, week, month, year) (default: month)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets platform-wide analytics including revenue, orders, and system stats
 */
async function getPlatformAnalytics(req, res) {
  try {
    // Verify admin role
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const period = req.query.period || "month";

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get all orders and calculate revenue
    const orders = await orderModel
      .find({ createdAt: { $gte: startDate } })
      .populate("seller", "shopId");

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalprice || 0),
      0,
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get shop statistics
    const totalShops = await shopModel.countDocuments();
    const verifiedShops = await shopModel.countDocuments({
      isverified: "verified",
    });
    const pendingShops = await shopModel.countDocuments({
      isverified: "pending",
    });
    const rejectedShops = await shopModel.countDocuments({
      isverified: "rejected",
    });

    // Get user statistics
    const totalUsers = await userModel.countDocuments({ role: "user" });
    const totalSellers = await userModel.countDocuments({ role: "seller" });
    const totalAdmins = await userModel.countDocuments({ role: "admin" });

    // Get order status distribution
    const orderStatuses = await orderModel.aggregate([
      {
        $group: {
          _id: "$orderstatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const orderStats = {};
    orderStatuses.forEach((status) => {
      orderStats[status._id || "unknown"] = status.count;
    });

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          average: parseFloat(averageOrderValue.toFixed(2)),
          period: period,
        },
        orders: {
          total: totalOrders,
          statusDistribution: orderStats,
        },
        shops: {
          total: totalShops,
          verified: verifiedShops,
          pending: pendingShops,
          rejected: rejectedShops,
        },
        users: {
          total: totalUsers,
          sellers: totalSellers,
          admins: totalAdmins,
        },
      },
      message: "Platform analytics retrieved successfully",
    });
  } catch (error) {
    console.error("Get platform analytics error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Revenue Trends Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Aggregation period (day, week, month, year) (default: month)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Array, message: String}
 * @description Gets revenue trends over time
 */
async function getRevenueTrends(req, res) {
  try {
    // Verify admin role
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const period = req.query.period || "month";

    // Determine grouping format based on period
    let groupBy = "%Y-%m-%d";
    if (period === "week") groupBy = "%Y-W%V";
    if (period === "month") groupBy = "%Y-%m";
    if (period === "year") groupBy = "%Y";

    // Get revenue trends
    const trends = await orderModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: groupBy, date: "$createdAt" },
          },
          revenue: { $sum: "$totalprice" },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalprice" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: trends.map((trend) => ({
        date: trend._id,
        revenue: parseFloat(trend.revenue.toFixed(2)),
        orders: trend.orders,
        averageOrderValue: parseFloat(trend.averageOrderValue.toFixed(2)),
      })),
      message: "Revenue trends retrieved successfully",
    });
  } catch (error) {
    console.error("Get revenue trends error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Shop Statistics Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets shop statistics and distribution
 */
async function getShopStats(req, res) {
  try {
    // Verify admin role
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    // Get top shops by orders
    const topShops = await orderModel.aggregate([
      {
        $group: {
          _id: "$seller",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalprice" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "shops",
          localField: "_id",
          foreignField: "seller",
          as: "shopDetails",
        },
      },
    ]);

    // Get shop distribution by status
    const shopDistribution = await shopModel.aggregate([
      {
        $group: {
          _id: "$isverified",
          count: { $sum: 1 },
        },
      },
    ]);

    const distribution = {};
    shopDistribution.forEach((item) => {
      distribution[item._id || "unknown"] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        topShops: topShops.map((shop) => ({
          sellerId: shop._id,
          shopName: shop.shopDetails?.[0]?.shopname || "Unknown",
          totalOrders: shop.totalOrders,
          totalRevenue: parseFloat(shop.totalRevenue.toFixed(2)),
        })),
        distribution: distribution,
      },
      message: "Shop statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Get shop stats error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Order Statistics Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets order statistics across all sellers
 */
async function getOrderStats(req, res) {
  try {
    // Verify admin role
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    // Get order status distribution
    const orderStats = await orderModel.aggregate([
      {
        $group: {
          _id: "$orderstatus",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalprice" },
        },
      },
    ]);

    const stats = {};
    orderStats.forEach((stat) => {
      stats[stat._id || "unknown"] = {
        count: stat.count,
        revenue: parseFloat(stat.totalRevenue.toFixed(2)),
      };
    });

    // Get total orders and revenue
    const totalStats = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalRevenue: { $sum: "$totalprice" },
          avgValue: { $avg: "$totalprice" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusDistribution: stats,
        totals: {
          totalOrders: totalStats[0]?.total || 0,
          totalRevenue: parseFloat(
            (totalStats[0]?.totalRevenue || 0).toFixed(2),
          ),
          averageOrderValue: parseFloat(
            (totalStats[0]?.avgValue || 0).toFixed(2),
          ),
        },
      },
      message: "Order statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  getPlatformAnalytics,
  getRevenueTrends,
  getShopStats,
  getOrderStats,
};
