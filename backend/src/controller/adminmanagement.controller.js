const userModel = require("../model/user.model");
const shopModel = require("../model/shop.model");
const productModel = require("../model/product.model");
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
 * Get All Regular Users Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Pagination page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 100)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
async function getAllUsers(req, res) {
  const adminId = req.user.id;

  try {
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can access this resource",
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;

    const users = await userModel
      .find({ role: "user" })
      .select("_id username email firstname lastname phonenumber createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await userModel.countDocuments({ role: "user" });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get All Sellers Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Pagination page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 100)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
async function getAllSellers(req, res) {
  const adminId = req.user.id;

  try {
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can access this resource",
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;

    let sellers = await userModel
      .find({ role: "seller" })
      .select(
        "_id username email firstname lastname phonenumber shop createdAt",
      )
      .populate("shop", "shopname isverified")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const missingShopSellerIds = sellers
      .filter((seller) => !seller.shop)
      .map((seller) => seller._id);

    if (missingShopSellerIds.length > 0) {
      const missingShops = await shopModel
        .find({ seller: { $in: missingShopSellerIds } })
        .select("seller shopname isverified");

      const shopMap = new Map(
        missingShops.map((shop) => [String(shop.seller), shop]),
      );

      sellers = sellers.map((seller) => {
        if (!seller.shop && shopMap.has(String(seller._id))) {
          return {
            ...seller.toObject(),
            shop: shopMap.get(String(seller._id)),
          };
        }
        return seller;
      });
    }

    const totalCount = await userModel.countDocuments({ role: "seller" });

    res.status(200).json({
      success: true,
      data: {
        sellers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Sellers retrieved successfully",
    });
  } catch (error) {
    console.error("Get all sellers error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Delete User Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {String} req.params.userId - User ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 */
async function deleteUser(req, res) {
  const adminId = req.user.id;
  const { userId } = req.params;

  try {
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can access this resource",
      });
    }

    if (adminId === userId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "You cannot delete your own admin account here",
      });
    }

    const userToDelete = await userModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    if (userToDelete.role !== "user") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "This endpoint only deletes regular users",
      });
    }

    await userModel.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      data: null,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Delete Seller Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - admin only)
 * @param {String} req.params.sellerId - Seller ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 */
async function deleteSeller(req, res) {
  const adminId = req.user.id;
  const { sellerId } = req.params;

  try {
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only admin users can access this resource",
      });
    }

    if (adminId === sellerId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "You cannot delete your own admin account here",
      });
    }

    const seller = await userModel.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "This endpoint only deletes seller accounts",
      });
    }

    const shop = await shopModel.findOne({ seller: sellerId });
    if (shop) {
      await productModel.deleteMany({ seller: shop._id });
      await shopModel.findByIdAndDelete(shop._id);
    }

    await userModel.findByIdAndDelete(sellerId);

    res.status(200).json({
      success: true,
      data: null,
      message: "Seller and related shop data deleted successfully",
    });
  } catch (error) {
    console.error("Delete seller error:", error);
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
  getAllUsers,
  getAllSellers,
  deleteUser,
  deleteSeller,
  removeAdmin,
};
