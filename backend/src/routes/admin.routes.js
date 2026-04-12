const express = require("express");
const adminController = require("../controller/admin.controller");
const {
  rejectShopValidation,
  verifyShopValidation,
  deleteShopValidation,
  bulkVerifyShopsValidation,
} = require("../services/admin.validation");

const routes = express.Router();

/**
 * GET /shops/pending
 * @description Get all pending shop verifications with pagination and search
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.search - Search by shop name (optional)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/shops/pending", adminController.getPendingShops);

/**
 * GET /shops
 * @description Get all shops with filtering and pagination
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.status - Filter by status (pending, verified, rejected)
 * @param {String} req.query.search - Search by shop name
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/shops", adminController.getAllShops);

/**
 * POST /shops/:shopId/verify
 * @description Verify a shop and set status to 'verified'
 * @param {String} req.params.shopId - Shop ID to verify
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.post(
  "/shops/:shopId/verify",
  verifyShopValidation,
  adminController.verifyShop,
);

/**
 * POST /shops/:shopId/reject
 * @description Reject a shop with a reason
 * @param {String} req.params.shopId - Shop ID to reject
 * @param {Object} req.body - Rejection details
 * @param {String} req.body.rejectionreason - Reason for rejection (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.post(
  "/shops/:shopId/reject",
  rejectShopValidation,
  adminController.rejectShop,
);

/**
 * POST /shops/bulk-verify
 * @description Bulk verify multiple shops at once
 * @param {Object} req.body - Bulk operation data
 * @param {Array} req.body.shopIds - Array of shop IDs to verify
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.post(
  "/shops/bulk-verify",
  bulkVerifyShopsValidation,
  adminController.bulkVerifyShops,
);

/**
 * DELETE /shops/:shopId
 * @description Delete a shop (admin only)
 * @param {String} req.params.shopId - Shop ID to delete
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.delete(
  "/shops/:shopId",
  deleteShopValidation,
  adminController.deleteShop,
);

module.exports = routes;
