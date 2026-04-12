const express = require("express");
const analyticsController = require("../controller/analytics.controller");

const routes = express.Router();

/**
 * GET /
 * @description Get seller analytics including revenue, sales, and inventory stats
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Analytics period (week, month, year) (default: month)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @data {Number} totalRevenue - Total revenue for the period
 * @data {Number} totalSales - Total number of completed orders
 * @data {Number} averageOrderValue - Average order value
 * @data {Object} inventorySummary - Inventory statistics
 * @data {Array} lowStockAlerts - Products with low stock
 * @middleware Authentication required, Role: seller
 */
routes.get("/", analyticsController.getAnalytics);

/**
 * GET /trends
 * @description Get revenue and order trends over time
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Aggregation period (day, week, month, year) (default: month)
 * @returns {Object} {success: Boolean, data: Array, message: String}
 * @data {Date} _id - Date identifier
 * @data {Number} revenue - Revenue for the period
 * @data {Number} orders - Number of orders for the period
 * @middleware Authentication required, Role: seller
 */
routes.get("/trends", analyticsController.getRevenueTrends);

module.exports = routes;
