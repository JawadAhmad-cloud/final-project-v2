const express = require("express");
const userController = require("../controller/user.controller");
const {
  completeProfileValidation,
  addAddressValidation,
  updateAddressValidation,
  deleteAddressValidation,
} = require("../services/user.validation");

const routes = express.Router();

/**
 * POST /profile/complete
 * @description Complete user profile with basic information
 * @param {Object} req.body - Profile information
 * @param {String} req.body.firstname - First name (required)
 * @param {String} req.body.lastname - Last name (required)
 * @param {String} req.body.phonenumber - Phone number (required)
 * @param {Date} req.body.dob - Date of birth (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.post(
  "/profile/complete",
  completeProfileValidation,
  userController.completeProfile,
);

/**
 * GET /profile
 * @description Get complete user profile
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.get("/profile", userController.getUserProfile);

/**
 * PUT /profile
 * @description Update user profile information
 * @param {Object} req.body - Profile fields to update (all optional)
 * @param {String} req.body.firstname - First name (optional)
 * @param {String} req.body.lastname - Last name (optional)
 * @param {String} req.body.phonenumber - Phone number (optional)
 * @param {Date} req.body.dob - Date of birth (optional)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.put("/profile", userController.updateUserProfile);

/**
 * POST /address
 * @description Add a new address to user profile
 * @param {Object} req.body - Address information
 * @param {String} req.body.street - Street address (required)
 * @param {String} req.body.city - City (required)
 * @param {String} req.body.postalcode - Postal code (required)
 * @param {String} req.body.country - Country (required)
 * @param {Boolean} req.body.isdefault - Set as default address (optional)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.post("/address", addAddressValidation, userController.addAddress);

/**
 * PUT /address/:addressId
 * @description Update an existing address
 * @param {String} req.params.addressId - Address ID (required)
 * @param {Object} req.body - Address fields to update (all optional)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.put(
  "/address/:addressId",
  updateAddressValidation,
  userController.updateAddress,
);

/**
 * DELETE /address/:addressId
 * @description Delete an address from user profile
 * @param {String} req.params.addressId - Address ID (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.delete(
  "/address/:addressId",
  deleteAddressValidation,
  userController.deleteAddress,
);

module.exports = routes;
