const shopModel = require("../model/shop.model");
const userModel = require("../model/user.model");
const { validationResult } = require("express-validator");

/**
 * Create Shop Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.shopname - Shop name
 * @param {String} req.body.description - Shop description
 * @param {String} req.body.email - Shop contact email
 * @param {String} req.body.phonenumber - Shop contact phone
 * @param {Object} req.body.shopaddress - Shop address object
 * @param {Object} req.body.buyingaddress - Seller's buying address object
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Creates a new shop for a seller (shop starts as pending verification)
 */
async function createShop(req, res) {
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
  const {
    shopname,
    description,
    email,
    phonenumber,
    shopaddress,
    buyingaddress,
  } = req.body;

  try {
    // Check if user is a seller
    const user = await userModel.findById(userId);
    if (!user || user.role !== "seller") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Only users with seller role can create a shop",
      });
    }

    // Check if seller already has a shop
    const existingShop = await shopModel.findOne({ seller: userId });
    if (existingShop) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "You already have a shop. A seller can only have one shop",
      });
    }

    // Create new shop
    const newShop = new shopModel({
      seller: userId,
      shopname,
      description,
      contact: {
        email,
        phonenumber,
      },
      shopaddress,
      buyingaddress,
      isverified: "pending", // Default to pending verification
    });

    await newShop.save();

    res.status(201).json({
      success: true,
      data: {
        shopId: newShop._id,
        seller: newShop.seller,
        shopname: newShop.shopname,
        description: newShop.description,
        contact: newShop.contact,
        shopaddress: newShop.shopaddress,
        buyingaddress: newShop.buyingaddress,
        isverified: newShop.isverified,
      },
      message: "Shop created successfully. Awaiting admin verification.",
    });
  } catch (error) {
    console.error("Create shop error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Shop Details Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Retrieves shop details for the seller (requires verified shop)
 */
async function getShopDetails(req, res) {
  const userId = req.user.id;

  try {
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Your shop is currently pending verification. Current status: ${shop.isverified}. Please wait for admin approval.`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        shopId: shop._id,
        shopname: shop.shopname,
        description: shop.description,
        contact: shop.contact,
        shopaddress: shop.shopaddress,
        buyingaddress: shop.buyingaddress,
        isverified: shop.isverified,
        rejectionreason: shop.rejectionreason,
        rating: shop.rating,
        products: shop.products,
      },
      message: "Shop details retrieved successfully",
    });
  } catch (error) {
    console.error("Get shop details error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Update Shop Information Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body (updateable fields)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Updates shop information (only for verified shops)
 */
async function updateShop(req, res) {
  const userId = req.user.id;
  const {
    shopname,
    description,
    email,
    phonenumber,
    shopaddress,
    buyingaddress,
  } = req.body;

  try {
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Your shop is currently pending verification. Current status: ${shop.isverified}. You can only update shop details after verification.`,
      });
    }

    // Update shop fields
    if (shopname) shop.shopname = shopname;
    if (description) shop.description = description;
    if (email || phonenumber) {
      shop.contact = {
        email: email || shop.contact.email,
        phonenumber: phonenumber || shop.contact.phonenumber,
      };
    }
    if (shopaddress) shop.shopaddress = shopaddress;
    if (buyingaddress) shop.buyingaddress = buyingaddress;

    await shop.save();

    res.status(200).json({
      success: true,
      data: {
        shopId: shop._id,
        shopname: shop.shopname,
        description: shop.description,
        contact: shop.contact,
        shopaddress: shop.shopaddress,
        buyingaddress: shop.buyingaddress,
      },
      message: "Shop information updated successfully",
    });
  } catch (error) {
    console.error("Update shop error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  createShop,
  getShopDetails,
  updateShop,
};
