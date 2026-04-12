const express = require("express");
const cartController = require("../controller/cart.controller");
const {
  addToCartValidation,
  removeFromCartValidation,
  updateCartQuantityValidation,
} = require("../services/cart.validation");

const routes = express.Router();

/**
 * POST /add
 * @description Add a product to user's cart
 * @param {Object} req.body - Item information
 * @param {String} req.body.productId - Product ID (required)
 * @param {Number} req.body.quantity - Quantity to add (optional, default: 1)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description If product already in cart, quantity will be incremented
 * @middleware Authentication required
 */
routes.post("/add", addToCartValidation, cartController.addToCart);

/**
 * DELETE /item/:itemId
 * @description Remove a product from user's cart
 * @param {String} req.params.itemId - Cart item ID (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.delete(
  "/item/:itemId",
  removeFromCartValidation,
  cartController.removeFromCart,
);

/**
 * PUT /item/:itemId/quantity
 * @description Update quantity of a cart item
 * @param {String} req.params.itemId - Cart item ID (required)
 * @param {Object} req.body - Update data
 * @param {Number} req.body.quantity - New quantity (required, must be > 0)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.put(
  "/item/:itemId/quantity",
  updateCartQuantityValidation,
  cartController.updateCartItemQuantity,
);

/**
 * GET /
 * @description Get user's cart with all items
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.get("/", cartController.getCart);

/**
 * DELETE /clear
 * @description Clear all items from user's cart
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required
 */
routes.delete("/clear", cartController.clearCart);

module.exports = routes;
