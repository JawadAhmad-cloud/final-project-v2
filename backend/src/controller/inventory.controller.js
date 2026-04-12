const productModel = require("../model/product.model");
const shopModel = require("../model/shop.model");
const { validationResult } = require("express-validator");

/**
 * Get Inventory Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.search - Search by product name
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all products with inventory details
 */
async function getInventory(req, res) {
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
        message: "Your shop must be verified to access inventory",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || "";

    // Build filters
    let filters = { seller: shop._id };
    if (search) filters.name = { $regex: search, $options: "i" };

    // Get products
    const products = await productModel
      .find(filters)
      .select(
        "name totalStock availableStock reservedStock price status rating",
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await productModel.countDocuments(filters);

    // Get inventory summary
    const inventorySummary = await productModel.aggregate([
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
        products,
        summary: inventorySummary[0] || {
          totalProducts: 0,
          totalStock: 0,
          totalReserved: 0,
          totalAvailable: 0,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Inventory retrieved successfully",
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Update Product Stock Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.body - Request body
 * @param {Number} req.body.totalStock - New total stock
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Updates product stock
 */
async function updateProductStock(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const userId = req.user.id;
  const { productId } = req.params;
  const { totalStock } = req.body;

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
        message: "Your shop must be verified to update inventory",
      });
    }

    // Get product
    const product = await productModel.findOne({
      _id: productId,
      seller: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found",
      });
    }

    // Calculate new available stock (totalStock - reserved)
    const newAvailableStock = totalStock - product.reservedStock;

    if (newAvailableStock < 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Cannot set total stock below reserved stock (${product.reservedStock})`,
      });
    }

    product.totalStock = totalStock;
    product.availableStock = newAvailableStock;

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        totalStock: product.totalStock,
        availableStock: product.availableStock,
        reservedStock: product.reservedStock,
      },
      message: "Product stock updated successfully",
    });
  } catch (error) {
    console.error("Update product stock error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Low Stock Products Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.threshold - Low stock threshold (default: 10)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets products with low stock levels
 */
async function getLowStockProducts(req, res) {
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
        message: "Your shop must be verified to access inventory",
      });
    }

    const threshold = req.query.threshold || 10;

    // Get low stock products
    const lowStockProducts = await productModel
      .find({
        seller: shop._id,
        $expr: { $lt: ["$availableStock", parseInt(threshold)] },
      })
      .select("name totalStock availableStock reservedStock price status")
      .sort({ availableStock: 1 });

    res.status(200).json({
      success: true,
      data: {
        threshold: threshold,
        products: lowStockProducts,
        count: lowStockProducts.length,
      },
      message: "Low stock products retrieved successfully",
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  getInventory,
  updateProductStock,
  getLowStockProducts,
};
