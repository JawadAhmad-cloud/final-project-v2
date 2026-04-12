const express = require("express");
const inventoryController = require("../controller/inventory.controller");
const {
  updateProductStockValidation,
} = require("../services/inventory.validation");

const routes = express.Router();

/**
 * GET /
 * @description Get inventory list with pagination and summary
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get("/", inventoryController.getInventory);

/**
 * GET /low-stock
 * @description Get products with low stock (below threshold)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.threshold - Stock threshold (default: 10)
 * @returns {Object} {success: Boolean, data: Array, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get("/low-stock", inventoryController.getLowStockProducts);

/**
 * PUT /stock/:productId
 * @description Update product stock
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.body - Stock update data
 * @param {Number} req.body.totalStock - New total stock value (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.put(
  "/stock/:productId",
  updateProductStockValidation,
  inventoryController.updateProductStock,
);

module.exports = routes;
