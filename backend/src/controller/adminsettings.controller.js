const userModel = require("../model/user.model");

/**
 * In-memory settings store (can be replaced with a database model later)
 * This stores admin system settings
 */
let systemSettings = {
  notifications: {
    emailAlerts: true,
    shopVerification: true,
    systemAlerts: true,
    adminChanges: true,
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
  },
  system: {
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
  },
  updatedAt: new Date(),
  updatedBy: null,
};

/**
 * Get Admin Settings Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all admin system settings
 */
async function getSettings(req, res) {
  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can access settings",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        settings: systemSettings,
      },
      message: "Settings retrieved successfully",
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Update Admin Settings Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.body - Settings data to update
 * @param {Object} req.body.settings - The settings object
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Updates admin system settings
 */
async function updateSettings(req, res) {
  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can update settings",
      });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid settings format",
      });
    }

    // Update settings
    systemSettings = {
      ...systemSettings,
      ...settings,
      updatedAt: new Date(),
      updatedBy: req.user.id,
    };

    res.status(200).json({
      success: true,
      data: {
        settings: systemSettings,
      },
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Reset Settings to Default Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Resets all settings to default values
 */
async function resetSettings(req, res) {
  try {
    // Check if user is admin
    const admin = await userModel.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin can reset settings",
      });
    }

    // Reset to default
    systemSettings = {
      notifications: {
        emailAlerts: true,
        shopVerification: true,
        systemAlerts: true,
        adminChanges: true,
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
      },
      system: {
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: true,
      },
      updatedAt: new Date(),
      updatedBy: req.user.id,
    };

    res.status(200).json({
      success: true,
      data: {
        settings: systemSettings,
      },
      message: "Settings reset to defaults successfully",
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};
