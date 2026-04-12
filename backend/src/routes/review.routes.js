const express = require("express");
const reviewController = require("../controller/review.controller");
const {
  addReviewValidation,
  getProductReviewsValidation,
} = require("../services/review.validation");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");

const routes = express.Router();

/**
 * POST /
 * @description Add a review for a product (verified purchase only)
 * @param {Object} req.body - Review information
 * @param {String} req.body.productId - Product ID (required)
 * @param {String} req.body.orderId - Order ID for verified purchase (required)
 * @param {Number} req.body.rating - Rating 1-5 (required)
 * @param {String} req.body.title - Review title (required, 3-100 chars)
 * @param {String} req.body.comment - Review comment (required, 10-1000 chars)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: user
 */
routes.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  addReviewValidation,
  reviewController.addReview,
);

/**
 * GET /:productId
 * @description Get all reviews for a product (public listing)
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.sort - Sort order (newest, oldest, rating-high, rating-low) (default: newest)
 * @returns {Object} {success: Boolean, data: Array, message: String}
 * @middleware None (public endpoint)
 */
routes.get(
  "/:productId",
  getProductReviewsValidation,
  reviewController.getProductReviews,
);

/**
 * GET /seller/:productId
 * @description Get reviews for seller's product
 * @param {String} req.params.productId - Product ID
 * @returns {Object} {success: Boolean, data: Array, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get(
  "/seller/:productId",
  authMiddleware,
  roleMiddleware("seller"),
  getProductReviewsValidation,
  reviewController.getSellerProductReviews,
);

module.exports = routes;
