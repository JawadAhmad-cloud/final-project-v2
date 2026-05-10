const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { blacklistToken } = require("../services/tokenBlacklist");
const { generateOTP, sendVerificationEmail } = require("../services/email.service");

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
 * @description Creates a new user account with hashed password and sends OTP to email
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
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create new user
    const user = new userModel({
      username: username,
      email: email,
      password: hash,
      otp: otp,
      otpexpiry: otpExpiry,
      isverified: false,
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, otp, username);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Delete the user if email cannot be sent
      await userModel.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        data: null,
        message: "Failed to send verification email. Please try again.",
      });
    }

    // Generate temporary JWT token (without role)
    const token = jwt.sign(
      { id: user._id, role: null, verified: false },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }, // Short expiry for unverified users
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
        verificationRequired: true,
      },
      message: "User registered successfully. Please verify your email with the OTP sent.",
    });

  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
 * Verify Email OTP Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.otp - One-time password
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Verifies user's email with OTP
 */
async function verifyEmail(req, res) {
  const { otp } = req.body;
  const userId = req.user?.id;

  // Validate input
  if (!otp) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "OTP is required",
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "User not authenticated",
    });
  }

  try {
    // Find user by ID
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isverified) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User is already verified",
      });
    }

    // Check if OTP has expired
    if (!user.otpexpiry || new Date() > user.otpexpiry) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      // Increment OTP attempts
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid OTP. Attempts remaining: ${5 - user.otpAttempts}`,
      });
    }

    // OTP is correct - mark email as verified
    user.isverified = true;
    user.otp = null;
    user.otpexpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Generate new JWT token with verified status
    const token = jwt.sign(
      { id: user._id, role: null, verified: true },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    // Update cookie
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
        token: token,
        roleRequired: true,
      },
      message: "Email verified successfully. Please select a role.",
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Resend OTP Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Resends OTP to user's email
 */
async function resendOTP(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "User not authenticated",
    });
  }

  try {
    // Find user by ID
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isverified) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User is already verified",
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update user with new OTP
    user.otp = newOtp;
    user.otpexpiry = otpExpiry;
    user.otpAttempts = 0; // Reset attempts
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, newOtp, user.username);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({
        success: false,
        data: null,
        message: "Failed to send OTP email",
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
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

module.exports = { signUp, login, logout, setRole, adminLogin, verifyEmail, resendOTP };
