const express = require("express");
const sellerorderController = require("./backend/src/controller/sellerorder.controller");
const {
  acceptOrderValidation,
  rejectOrderValidation,
  completeOrderValidation,
  deleteOrderValidation,
} = require("./backend/src/services/sellerorder.validation");

const routes = express.Router();

/**
 * GET /
 * @description Get seller's orders with pagination and filters
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.status - Filter by order status (pending, accepted, rejected, shipped, delivered)
 * @param {String} req.query.sellerStatus - Filter by seller status (pending, accepted, rejected, completed)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get("/", sellerorderController.getSellerOrders);

/**
 * POST /:orderId/accept
 * @description Accept an order by seller
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.post(
  "/:orderId/accept",
  acceptOrderValidation,
  sellerorderController.acceptOrder,
);

/**
 * POST /:orderId/reject
 * @description Reject an order by seller
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.post(
  "/:orderId/reject",
  rejectOrderValidation,
  sellerorderController.rejectOrder,
);

/**
 * POST /:orderId/complete
 * @description Mark order as completed by seller
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.post(
  "/:orderId/complete",
  completeOrderValidation,
  sellerorderController.completeOrder,
);

/**
 * DELETE /:orderId
 * @description Delete a completed order
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.delete(
  "/:orderId",
  deleteOrderValidation,
  sellerorderController.deleteOrder,
);

module.exports = routes;
