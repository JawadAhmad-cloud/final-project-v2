const express = require("express");
const sellerController = require("../controller/seller.controller");
const {
  createShopValidation,
  updateShopValidation,
} = require("../services/seller.validation");

const routes = express.Router();

/**
 * POST /shop
 * @description Create a new shop for a seller
 * @param {Object} req.body - Shop information
 * @param {String} req.body.shopname - Shop name (required)
 * @param {String} req.body.description - Shop description (required)
 * @param {String} req.body.email - Shop contact email (required)
 * @param {String} req.body.phonenumber - Shop contact phone (required)
 * @param {Object} req.body.shopaddress - Shop business address (required)
 * @param {Object} req.body.buyingaddress - Seller's buying/billing address (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Shop will be created with isverified status as 'pending'
 * @middleware Authentication required, Role: seller
 */
routes.post("/shop", createShopValidation, sellerController.createShop);

/**
 * GET /shop
 * @description Get shop details for the authenticated seller
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get("/shop", sellerController.getShopDetails);

/**
 * PUT /shop
 * @description Update shop information
 * @param {Object} req.body - Shop fields to update (all optional)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.put("/shop", updateShopValidation, sellerController.updateShop);

module.exports = routes;
