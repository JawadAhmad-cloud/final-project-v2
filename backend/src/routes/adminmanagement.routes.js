const express = require("express");
const adminManagementController = require("../controller/adminmanagement.controller");
const {
  addNewAdminValidation,
  removeAdminValidation,
  deleteUserValidation,
  deleteSellerValidation,
} = require("../services/adminmanagement.validation");

const routes = express.Router();

/**
 * POST /add-admin
 * @description Add a new admin user (only existing admins can do this)
 * @param {Object} req.body - New admin information
 * @param {String} req.body.username - Username (required, 3-30 chars)
 * @param {String} req.body.email - Email (required, valid email)
 * @param {String} req.body.password - Password (required, 6+ chars with uppercase, lowercase, number)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.post(
  "/add-admin",
  addNewAdminValidation,
  adminManagementController.addNewAdmin,
);

/**
 * GET /all-users
 * @description Get all regular users with pagination
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/all-users", adminManagementController.getAllUsers);

/**
 * GET /all-sellers
 * @description Get all sellers with pagination
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/all-sellers", adminManagementController.getAllSellers);

/**
 * GET /all-admins
 * @description Get all admin users with pagination
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/all-admins", adminManagementController.getAllAdmins);

/**
 * DELETE /remove-admin/:adminIdToRemove
 * @description Remove admin privileges from a user
 * @param {String} req.params.adminIdToRemove - Admin ID to remove (required)
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description User will be converted to 'user' role
 * @middleware Authentication required, Role: admin
 */
routes.delete(
  "/remove-admin/:adminIdToRemove",
  removeAdminValidation,
  adminManagementController.removeAdmin,
);

/**
 * DELETE /delete-user/:userId
 * @description Delete a regular user account
 * @param {String} req.params.userId - User ID to delete
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.delete(
  "/delete-user/:userId",
  deleteUserValidation,
  adminManagementController.deleteUser,
);

/**
 * DELETE /delete-seller/:sellerId
 * @description Delete a seller account and related shop data
 * @param {String} req.params.sellerId - Seller ID to delete
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.delete(
  "/delete-seller/:sellerId",
  deleteSellerValidation,
  adminManagementController.deleteSeller,
);

module.exports = routes;
