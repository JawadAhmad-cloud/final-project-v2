const shopModel = require("../model/shop.model");
const userModel = require("../model/user.model");
const { validationResult } = require("express-validator");

/**
 * Get Pending Shop Verifications Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Pagination page number
 * @param {Number} req.query.limit - Items per page
 * @param {String} req.query.search - Search by shop name
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all shops pending verification with pagination and search
 */
async function getPendingShops(req, res) {
  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || "";

    // Build search filter
    const searchFilter = search
      ? { shopname: { $regex: search, $options: "i" } }
      : {};

    // Get pending shops
    const pendingShops = await shopModel
      .find({ isverified: "pending", ...searchFilter })
      .populate("seller", "username email phonenumber")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await shopModel.countDocuments({
      isverified: "pending",
      ...searchFilter,
    });

    res.status(200).json({
      success: true,
      data: {
        shops: pendingShops,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Pending shops retrieved successfully",
    });
  } catch (error) {
    console.error("Get pending shops error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get All Shops Handler (with filtering)
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.status - Filter by status (pending, verified, rejected)
 * @param {String} req.query.search - Search by shop name
 * @param {Number} req.query.page - Pagination page number
 * @param {Number} req.query.limit - Items per page
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all shops with filters and pagination
 */
async function getAllShops(req, res) {
  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const status = req.query.status || null;
    const search = req.query.search || "";

    // Build filters
    let filters = {};
    if (status) filters.isverified = status;
    if (search) filters.shopname = { $regex: search, $options: "i" };

    // Get shops
    const shops = await shopModel
      .find(filters)
      .populate("seller", "username email phonenumber firstname lastname")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await shopModel.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: {
        shops,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Shops retrieved successfully",
    });
  } catch (error) {
    console.error("Get all shops error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Verify Shop Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {String} req.params.shopId - Shop ID to verify
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Approves a shop for verification
 */
async function verifyShop(req, res) {
  const { shopId } = req.params;

  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const shop = await shopModel.findById(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Update shop status
    shop.isverified = "verified";
    shop.rejectionreason = null;
    await shop.save();

    res.status(200).json({
      success: true,
      data: {
        shopId: shop._id,
        shopname: shop.shopname,
        isverified: shop.isverified,
      },
      message: "Shop verified successfully",
    });
  } catch (error) {
    console.error("Verify shop error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Reject Shop Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {String} req.params.shopId - Shop ID to reject
 * @param {Object} req.body - Request body
 * @param {String} req.body.rejectionreason - Reason for rejection
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Rejects a shop verification with a reason
 */
async function rejectShop(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { shopId } = req.params;
  const { rejectionreason } = req.body;

  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const shop = await shopModel.findById(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Update shop status
    shop.isverified = "rejected";
    shop.rejectionreason = rejectionreason;
    await shop.save();

    res.status(200).json({
      success: true,
      data: {
        shopId: shop._id,
        shopname: shop.shopname,
        isverified: shop.isverified,
        rejectionreason: shop.rejectionreason,
      },
      message: "Shop rejected successfully",
    });
  } catch (error) {
    console.error("Reject shop error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Bulk Verify Shops Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.body - Request body
 * @param {Array} req.body.shopIds - Array of shop IDs to verify
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Bulk verifies multiple shops at once
 */
async function bulkVerifyShops(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { shopIds } = req.body;

  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    // Verify all shops in the array
    const updateResult = await shopModel.updateMany(
      { _id: { $in: shopIds } },
      { isverified: "verified", rejectionreason: null },
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount,
      },
      message: `${updateResult.modifiedCount} shops verified successfully`,
    });
  } catch (error) {
    console.error("Bulk verify shops error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Delete Shop Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {String} req.params.shopId - Shop ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Deletes a shop (admin only)
 */
async function deleteShop(req, res) {
  const { shopId } = req.params;

  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access this resource",
      });
    }

    const shop = await shopModel.findByIdAndDelete(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    console.error("Delete shop error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  getPendingShops,
  getAllShops,
  verifyShop,
  rejectShop,
  bulkVerifyShops,
  deleteShop,
};
