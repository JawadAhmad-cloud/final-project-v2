const orderModel = require("../model/order.model");
const shopModel = require("../model/shop.model");
const { validationResult } = require("express-validator");
const socketService = require("../services/socket.service");

/**
 * Get Seller Orders Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.status - Filter by status (pending, accepted, rejected, shipped, delivered, cancelled)
 * @param {String} req.query.sellerStatus - Filter by seller status (pending, accepted, rejected, completed)
 * @param {String} req.query.search - Search by user email or order ID
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all orders for seller with filters and pagination
 */
async function getSellerOrders(req, res) {
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
        message: "Your shop must be verified to manage orders",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const status = req.query.status || "";
    const sellerStatus = req.query.sellerStatus || "";
    const search = req.query.search || "";

    // Build filters
    let filters = { seller: shop._id };
    if (status) filters.status = status;
    if (sellerStatus) filters.sellerStatus = sellerStatus;

    // Get orders
    const orders = await orderModel
      .find(filters)
      .populate("user", "username email phonenumber")
      .populate("items.product", "name price")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await orderModel.countDocuments(filters);

    // Get summary cards
    const totalOrders = await orderModel.countDocuments({ seller: shop._id });
    const pendingOrders = await orderModel.countDocuments({
      seller: shop._id,
      sellerStatus: "pending",
    });
    const acceptedOrders = await orderModel.countDocuments({
      seller: shop._id,
      sellerStatus: "accepted",
    });
    const completedOrders = await orderModel.countDocuments({
      seller: shop._id,
      sellerStatus: "completed",
    });

    res.status(200).json({
      success: true,
      data: {
        items: orders, // For frontend compatibility
        orders,
        total: totalCount, // For frontend compatibility
        summary: {
          totalOrders,
          pendingOrders,
          acceptedOrders,
          completedOrders,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Accept Order Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.orderId - Order ID to accept
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Seller accepts an order
 */
async function acceptOrder(req, res) {
  const userId = req.user.id;
  const { orderId } = req.params;
  const io = req.app.get("io");

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
        message: "Your shop must be verified to accept orders",
      });
    }

    // Get and update order
    const order = await orderModel.findOne({
      _id: orderId,
      seller: shop._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Order not found",
      });
    }

    if (order.sellerStatus !== "pending") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Order is no longer pending",
      });
    }

    order.sellerStatus = "accepted";
    order.status = "accepted";
    await order.save();

    // Emit socket notification about order acceptance
    if (io) {
      socketService.notifySellerOrderUpdate(io, shop._id, order, "accepted");
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        sellerStatus: order.sellerStatus,
        status: order.status,
      },
      message: "Order accepted successfully",
    });
  } catch (error) {
    console.error("Accept order error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Reject Order Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.orderId - Order ID to reject
 * @param {Object} req.body - Request body
 * @param {String} req.body.reason - Rejection reason (optional)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Seller rejects an order
 */
async function rejectOrder(req, res) {
  const userId = req.user.id;
  const { orderId } = req.params;
  const io = req.app.get("io");

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
        message: "Your shop must be verified to reject orders",
      });
    }

    // Get and update order
    const order = await orderModel.findOne({
      _id: orderId,
      seller: shop._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Order not found",
      });
    }

    if (order.sellerStatus !== "pending") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Order is no longer pending",
      });
    }

    order.sellerStatus = "rejected";
    order.status = "rejected";
    // TODO: Reverse reserved stock
    await order.save();

    // Emit socket notification about order rejection
    if (io) {
      socketService.notifySellerOrderUpdate(io, shop._id, order, "rejected");
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        sellerStatus: order.sellerStatus,
        status: order.status,
      },
      message: "Order rejected successfully",
    });
  } catch (error) {
    console.error("Reject order error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Complete Order Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.orderId - Order ID to complete
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Marks order as completed (seller gets paid)
 */
async function completeOrder(req, res) {
  const userId = req.user.id;
  const { orderId } = req.params;
  const io = req.app.get("io");

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
        message: "Your shop must be verified to complete orders",
      });
    }

    // Get and update order
    const order = await orderModel.findOne({
      _id: orderId,
      seller: shop._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Order not found",
      });
    }

    if (order.sellerStatus === "completed") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Order is already completed",
      });
    }

    order.sellerStatus = "completed";
    order.status = "accepted";
    // TODO: Process payment to seller
    await order.save();

    // Emit socket notification about order completion
    if (io) {
      socketService.notifySellerOrderUpdate(io, shop._id, order, "completed");
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        sellerStatus: order.sellerStatus,
        status: order.status,
        trackingNumber: order.shipping?.trackingNumber,
      },
      message: "Order completed successfully. TCS tracking ID generated.",
    });
  } catch (error) {
    console.error("Complete order error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Delete Order Handler
 * @async
 * @pa},
      message: "Order marked as completed. Ready for shipping
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Deletes a completed order
 */
async function deleteOrder(req, res) {
  const userId = req.user.id;
  const { orderId } = req.params;

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
        message: "Your shop must be verified to delete orders",
      });
    }
    // Get order
    const order = await orderModel.findOne({
      _id: orderId,
      seller: shop._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Order not found",
      });
    }

    if (
      order.sellerStatus !== "completed" &&
      order.sellerStatus !== "rejected"
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Only completed or rejected orders can be deleted",
      });
    }

    await orderModel.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      data: null,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  getSellerOrders,
  acceptOrder,
  rejectOrder,
  completeOrder,
  deleteOrder,
};
