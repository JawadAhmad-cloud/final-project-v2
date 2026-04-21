const reviewModel = require("../model/review.model");
const productModel = require("../model/product.model");
const orderModel = require("../model/order.model");
const { validationResult } = require("express-validator");

/**
 * Add Review Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.productId - Product ID to review
 * @param {String} req.body.orderId - Order ID (proof of purchase)
 * @param {Number} req.body.rating - Rating (1-5)
 * @param {String} req.body.title - Review title
 * @param {String} req.body.comment - Review comment
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Creates a review for a purchased product
 */
async function addReview(req, res) {
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
  const { productId, orderId, rating, title, comment } = req.body;

  try {
    // Get product to check if user is the seller
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found",
      });
    }

    // Check if user is the seller (get shop and verify)
    const shopModel = require("../model/shop.model");
    const shop = await shopModel.findById(product.seller);
    if (shop && shop.seller.toString() === userId) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "You cannot review your own product",
      });
    }

    // Verify order exists and user purchased the product
    let isVerifiedPurchase = false;

    if (orderId) {
      const order = await orderModel.findOne({
        _id: orderId,
        user: userId,
        status: "delivered", // Only allow reviews for delivered orders
      });

      isVerifiedPurchase = !!order;
    }

    // Check if user already reviewed this product
    const existingReview = await reviewModel.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const newReview = new reviewModel({
      product: productId,
      user: userId,
      order: orderId,
      rating,
      title,
      comment,
      isVerifiedPurchase,
    });

    await newReview.save();

    // Update product rating and reviews array
    const allReviews = await reviewModel.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await productModel.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: allReviews.length,
      $push: { reviews: newReview._id },
    });

    res.status(201).json({
      success: true,
      data: {
        reviewId: newReview._id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        isVerifiedPurchase: newReview.isVerifiedPurchase,
      },
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Product Reviews Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.sort - Sort by (newest, oldest, rating-high, rating-low)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all reviews for a product with pagination
 */
async function getProductReviews(req, res) {
  const { productId } = req.params;

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sort = req.query.sort || "newest";

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort === "oldest") sortObj = { createdAt: 1 };
    if (sort === "rating-high") sortObj = { rating: -1 };
    if (sort === "rating-low") sortObj = { rating: 1 };

    // Get reviews
    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "username email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);

    // Get total count
    const totalCount = await reviewModel.countDocuments({ product: productId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Reviews retrieved successfully",
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Seller Product Reviews Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets reviews for seller's product
 */
async function getSellerProductReviews(req, res) {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    // Verify product belongs to seller
    const productModel = require("../model/product.model");
    const shopModel = require("../model/shop.model");

    const shop = await shopModel.findOne({ seller: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

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

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    // Get reviews
    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "username email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await reviewModel.countDocuments({ product: productId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Product reviews retrieved successfully",
    });
  } catch (error) {
    console.error("Get seller product reviews error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  addReview,
  getProductReviews,
  getSellerProductReviews,
};
