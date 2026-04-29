const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { blacklistToken } = require("../services/tokenBlacklist");

/**
 * Sign Up Handler
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {String} req.body.username - Username (required, min 3 chars)
 * @param {String} req.body.email - Email address (required, valid email)
 * @param {String} req.body.password - Password (required, min 6 chars)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Creates a new user account with hashed password
 */
async function signUp(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array().map((err) => err.msg),
    });
    console.log(errors.array().map((err) => err.msg));
  }

  const { username, email, password } = req.body;

  try {
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
      console.log(message);
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new userModel({
      username: username,
      email: email,
      password: hash,
    });

    await user.save();

    // Generate JWT token (role will be set later)
    const token = jwt.sign(
      { id: user._id, role: null },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: token,
        roleRequired: true,
      },
      message: "User created successfully. Please select a role.",
    });
    console.log(message);
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
    console.log(message);
  }
}

/**
 * Login Handler
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {String} req.body.email - Email address (required, valid email)
 * @param {String} req.body.password - Password (required, min 6 chars)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Authenticates user and returns JWT token
 */
async function login(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array().map((err)=>err.msg),
    });
  }

  const { email, password } = req.body;

  try {
    // Find user by email and select password field
    const user = await userModel
      .findOne({
        email,
      })
      .select("email username +password role");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Logout Handler
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Clears user authentication token
 */
async function logout(req, res) {
  try {
    // Clear the authentication cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      data: null,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Set User Role Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.role - Selected role (user or seller)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Sets the role for newly registered user (called after signup)
 */
async function setRole(req, res) {
  const { validationResult } = require("express-validator");

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

  const { role } = req.body;
  const userId = req.user.id; // Assuming auth middleware sets user info

  try {
    // Validate role
    if (!["user", "seller"].includes(role)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid role. Role must be 'user' or 'seller'",
      });
    }

    // Update user role
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // Regenerate token with new role
    const token = jwt.sign(
      { id: updatedUser._id, role: updatedUser.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    // Blacklist the old token to prevent reuse
    blacklistToken(req.token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        token: token,
      },
      message: `Role set to ${role} successfully`,
    });
  } catch (error) {
    console.error("Set role error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Admin Login Handler
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {String} req.body.email - Admin email address (required, valid email)
 * @param {String} req.body.password - Admin password (required, min 6 chars)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Authenticates admin user and returns JWT token
 */
async function adminLogin(req, res) {
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

  const { email, password } = req.body;

  try {
    // Find user by email and select password field
    const admin = await userModel
      .findOne({
        email,
        role: "admin", // Only allow users with admin role to login
      })
      .select("email username +password role");

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid admin credentials",
      });
    }

    // Verify password
    const verifyPassword = await bcrypt.compare(password, admin.password);
    if (!verifyPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid admin credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        token: token,
      },
      message: "Admin logged in successfully",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = { signUp, login, logout, setRole, adminLogin };
