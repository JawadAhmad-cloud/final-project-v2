const express = require("express");
const adminSettingsController = require("../controller/adminsettings.controller");

const routes = express.Router();

/**
 * GET /
 * @description Get all admin system settings
 * @returns {Object} {success: Boolean, data: {settings: Object}, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.get("/", adminSettingsController.getSettings);

/**
 * PUT /
 * @description Update admin system settings
 * @param {Object} req.body - Settings data
 * @param {Object} req.body.settings - The settings object to update
 * @returns {Object} {success: Boolean, data: {settings: Object}, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.put("/", adminSettingsController.updateSettings);

/**
 * POST /reset
 * @description Reset admin settings to defaults
 * @returns {Object} {success: Boolean, data: {settings: Object}, message: String}
 * @middleware Authentication required, Role: admin
 */
routes.post("/reset", adminSettingsController.resetSettings);

module.exports = routes;
