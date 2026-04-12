const express = require("express");
const favouriteController = require("../controller/favourite.controller");
const {
  addToFavouriteValidation,
  removeFromFavouriteValidation,
} = require("../services/favourite.validation");

const routes = express.Router();

/**
 * POST /add
 * @description Add a product to user's favourite list
 * @param {Object} req.body - Item information
 * @param {String} req.body.productId - Product ID (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.post(
  "/add",
  addToFavouriteValidation,
  favouriteController.addToFavourite,
);

/**
 * DELETE /:productId
 * @description Remove a product from user's favourite list
 * @param {String} req.params.productId - Product ID (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.delete(
  "/:productId",
  removeFromFavouriteValidation,
  favouriteController.removeFromFavourite,
);

/**
 * GET /
 * @description Get user's favourite list with all products
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required
 */
routes.get("/", favouriteController.getFavourites);

/**
 * DELETE /clear
 * @description Clear all products from user's favourite list
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required
 */
routes.delete("/clear", favouriteController.clearFavourites);

module.exports = routes;
