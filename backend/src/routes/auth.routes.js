const express = require("express");
const authcontroller = require("../controller/auth.controller");
const {
  signUpValidation,
  loginValidation,
  adminLoginValidation,
} = require("../services/auth.validation");
const { setRoleValidation } = require("../services/role.validation");
const { authMiddleware } = require("../middleware/auth.middleware");

const routes = express.Router();

/**
 * POST /register
 * @description User registration endpoint
 * @param {Object} req.body - User registration data
 * @param {String} req.body.username - Required, 3-30 characters
 * @param {String} req.body.email - Required, valid email format
 * @param {String} req.body.password - Required, min 6 characters with uppercase, lowercase, and number
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.post("/register", signUpValidation, authcontroller.signUp);

/**
 * POST /login
 * @description User login endpoint
 * @param {Object} req.body - User login credentials
 * @param {String} req.body.email - Required, valid email format
 * @param {String} req.body.password - Required, min 6 characters
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.post("/login", loginValidation, authcontroller.login);

/**
 * POST /logout
 * @description User logout endpoint
 * @returns {Object} {success: Boolean, data: null, message: String}
 */
routes.post("/logout", authcontroller.logout);

/**
 * POST /set-role
 * @description Set user role after registration (user or seller)
 * @param {Object} req.body - Role selection data
 * @param {String} req.body.role - Either 'user' or 'seller'
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.post(
  "/set-role",
  authMiddleware,
  setRoleValidation,
  authcontroller.setRole,
);

/**
 * POST /admin-login
 * @description Admin login endpoint (separate from regular user login)
 * @param {Object} req.body - Admin login credentials
 * @param {String} req.body.email - Required, valid email format
 * @param {String} req.body.password - Required, min 6 characters
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Only users with admin role can login here
 */
routes.post("/admin-login", adminLoginValidation, authcontroller.adminLogin);

module.exports = routes;
