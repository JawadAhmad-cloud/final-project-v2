const orderModel = require("../model/order.model");
const productModel = require("../model/product.model");
const shopModel = require("../model/shop.model");

/**
 * Get Analytics Data Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Time period (week, month, year)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets analytics data for seller dashboard
 */
async function getAnalytics(req, res) {
  const userId = req.user.id;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified to access analytics",
      });
    }

    const period = req.query.period || "month"; // week, month, year

    // Calculate date range
    let dateFrom = new Date();
    if (period === "week") dateFrom.setDate(dateFrom.getDate() - 7);
    else if (period === "month") dateFrom.setMonth(dateFrom.getMonth() - 1);
    else if (period === "year")
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);

    // Get completed orders in period
    const completedOrders = await orderModel
      .find({
        seller: shop._id,
        sellerStatus: "completed",
        updatedAt: { $gte: dateFrom },
      })
      .populate("items.product");

    // Calculate metrics
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalSales = completedOrders.length;

    // Get all products for low stock alerts
    const lowStockProducts = await productModel
      .find({
        seller: shop._id,
        $expr: { $lt: ["$availableStock", 10] }, // Alert if less than 10 in stock
      })
      .select("name availableStock totalStock");

    // Get total inventory stats
    const inventoryStats = await productModel.aggregate([
      { $match: { seller: shop._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$totalStock" },
          totalReserved: { $sum: "$reservedStock" },
          totalAvailable: { $sum: "$availableStock" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: period,
        metrics: {
          totalRevenue: totalRevenue,
          totalSales: totalSales,
          averageOrderValue:
            totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0,
        },
        inventory: inventoryStats[0] || {
          totalProducts: 0,
          totalStock: 0,
          totalReserved: 0,
          totalAvailable: 0,
        },
        alerts: {
          lowStockProducts: lowStockProducts,
          lowStockCount: lowStockProducts.length,
        },
      },
      message: "Analytics data retrieved successfully",
    });
  } catch (error) {
    console.error("Get analytics error:", error);
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
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Time period (week, month, year)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets revenue trends data for graphs
 */
async function getRevenueTrends(req, res) {
  const userId = req.user.id;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified to access analytics",
      });
    }

    const period = req.query.period || "month";

    // Calculate date range
    let dateFrom = new Date();
    let groupBy = { $dayOfMonth: "$updatedAt" }; // Default: day

    if (period === "week") {
      dateFrom.setDate(dateFrom.getDate() - 7);
      groupBy = { $dayOfWeek: "$updatedAt" };
    } else if (period === "month") {
      dateFrom.setMonth(dateFrom.getMonth() - 1);
      groupBy = { $dayOfMonth: "$updatedAt" };
    } else if (period === "year") {
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
      groupBy = { $month: "$updatedAt" };
    }

    // Get revenue trends
    const trends = await orderModel.aggregate([
      {
        $match: {
          seller: shop._id,
          sellerStatus: "completed",
          updatedAt: { $gte: dateFrom },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: period,
        trends: trends,
      },
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

module.exports = {
  getAnalytics,
  getRevenueTrends,
};
