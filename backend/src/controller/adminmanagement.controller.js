const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

/**
 * Add New Admin Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.body - Request body
 * @param {String} req.body.username - Username for new admin
 * @param {String} req.body.email - Email for new admin
 * @param {String} req.body.password - Password for new admin
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Creates a new admin user (only existing admins can do this)
 */
async function addNewAdmin(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const adminId = req.user.id;
  const { username, email, password } = req.body;

  try {
    // Verify that the requester is an admin
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can add new admins",
      });
    }

    // Check if user already exists
    const userExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = new userModel({
      username: username,
      email: email,
      password: hash,
      role: "admin", // Set role to admin directly
      isactive: true,
      isverified: true, // Admins are auto-verified
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      data: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
      message: "New admin created successfully",
    });
  } catch (error) {
    console.error("Add new admin error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get All Admins Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Pagination page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Retrieves all admin users with pagination
 */
async function getAllAdmins(req, res) {
  const adminId = req.user.id;

  try {
    // Verify that the requester is an admin
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can access this resource",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    // Get all admins
    const admins = await userModel
      .find({ role: "admin" })
      .select("_id username email isactive createdAt updatedAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await userModel.countDocuments({ role: "admin" });

    res.status(200).json({
      success: true,
      data: {
        admins: admins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Admins retrieved successfully",
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Remove Admin Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {String} req.params.adminId - Admin ID to remove
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Removes admin privileges from a user (changes role to 'user')
 */
async function removeAdmin(req, res) {
  const adminId = req.user.id;
  const { adminIdToRemove } = req.params;

  try {
    // Verify that the requester is an admin
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can remove admins",
      });
    }

    // Prevent admin from removing themselves
    if (adminId === adminIdToRemove) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "You cannot remove your own admin privileges",
      });
    }

    // Find and update the admin to be removed
    const adminToRemove = await userModel.findByIdAndUpdate(
      adminIdToRemove,
      { role: "user" }, // Change role from admin to user
      { new: true },
    );

    if (!adminToRemove) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: `Admin privileges removed from ${adminToRemove.username}`,
    });
  } catch (error) {
    console.error("Remove admin error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  addNewAdmin,
  getAllAdmins,
  removeAdmin,
};
