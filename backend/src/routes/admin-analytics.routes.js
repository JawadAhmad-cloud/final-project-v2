const express = require("express");
const adminAnalyticsController = require("../controller/admin-analytics.controller");

const routes = express.Router();

/**
 * GET /
 * @description Get platform-wide analytics including revenue, orders, and system stats
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Analytics period (day, week, month, year) (default: month)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/", adminAnalyticsController.getPlatformAnalytics);

/**
 * GET /revenue-trends
 * @description Get revenue trends over time
 * @param {Object} req.query - Query parameters
 * @param {String} req.query.period - Aggregation period (day, week, month, year) (default: month)
 * @returns {Object} {success: Boolean, data: Array, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/revenue-trends", adminAnalyticsController.getRevenueTrends);

/**
 * GET /shop-stats
 * @description Get shop statistics and distribution
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/shop-stats", adminAnalyticsController.getShopStats);

/**
 * GET /order-stats
 * @description Get order statistics across all sellers
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/order-stats", adminAnalyticsController.getOrderStats);

module.exports = routes;
