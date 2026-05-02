const userModel = require("../model/user.model");
const { validationResult } = require("express-validator");

/**
 * Complete User Profile Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.firstname - First name
 * @param {String} req.body.lastname - Last name
 * @param {String} req.body.phonenumber - Phone number
 * @param {Date} req.body.dob - Date of birth
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Completes user profile with basic information
 */
async function completeProfile(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array().map((err)=>err.msg ||err),
    });
  }

  const userId = req.user.id;
  const { firstname, lastname, phonenumber, dob } = req.body;

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        firstname: firstname,
        lastname: lastname,
        phonenumber: phonenumber,
        dob: dob,
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        phonenumber: updatedUser.phonenumber,
        dob: updatedUser.dob,
      },
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get User Profile Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Retrieves complete user profile including addresses
 */
async function getUserProfile(req, res) {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        phonenumber: user.phonenumber,
        dob: user.dob,
        addresses: user.addresses,
        role: user.role,
        isactive: user.isactive,
      },
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Add Address Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.street - Street address
 * @param {String} req.body.city - City name
 * @param {String} req.body.postalcode - Postal code
 * @param {String} req.body.country - Country name
 * @param {Boolean} req.body.isdefault - Set as default address
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Adds a new address to user profile
 */
async function addAddress(req, res) {
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

  const userId = req.user.id;
  const { street, city, postalcode, country, isdefault } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // If marking as default, unset other defaults
    if (isdefault) {
      user.addresses.forEach((addr) => {
        addr.isdefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      street,
      city,
      postalcode,
      country,
      isdefault: isdefault || false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        addresses: user.addresses,
      },
      message: "Address added successfully",
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Update Address Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {String} req.params.addressId - Address ID to update
 * @param {Object} req.body - Request body (street, city, postalcode, country, isdefault)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Updates an existing address
 */
async function updateAddress(req, res) {
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

  const userId = req.user.id;
  const { addressId } = req.params;
  const { street, city, postalcode, country, isdefault } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // Find address by ID
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Address not found",
      });
    }

    // If marking as default, unset other defaults
    if (isdefault) {
      user.addresses.forEach((addr, idx) => {
        if (idx !== addressIndex) {
          addr.isdefault = false;
        }
      });
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      street: street || user.addresses[addressIndex].street,
      city: city || user.addresses[addressIndex].city,
      postalcode: postalcode || user.addresses[addressIndex].postalcode,
      country: country || user.addresses[addressIndex].country,
      isdefault:
        isdefault !== undefined
          ? isdefault
          : user.addresses[addressIndex].isdefault,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        address: user.addresses[addressIndex],
      },
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Delete Address Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {String} req.params.addressId - Address ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Deletes an address from user profile
 */
async function deleteAddress(req, res) {
  const userId = req.user.id;
  const { addressId } = req.params;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // Find and remove address
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Address not found",
      });
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        addresses: user.addresses,
      },
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  completeProfile,
  getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
