const mongoose = require("mongoose");

/**
 * Shop Schema
 * @description Stores seller shop information
 * @typedef {Object} Shop
 * @property {ObjectId} seller - Reference to User model (seller)
 * @property {String} shopname - Name of the shop
 * @property {String} description - Shop description
 * @property {Object} contact - Shop contact information (email, phonenumber)
 * @property {Object} shopaddress - Shop's business address
 * @property {Object} buyingaddress - Seller's address for buying/billing
 * @property {Array} products - Array of product references
 * @property {String} isverified - Verification status (pending, verified, rejected)
 * @property {String} rejectionreason - Reason for shop rejection if rejected
 * @property {Number} rating - Shop rating
 * @property {Date} createdAt - Auto timestamp
 * @property {Date} updatedAt - Auto timestamp
 */

const shopSchema = new mongoose.Schema(
  {
    // Seller who owns this shop
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Shop basic info
    shopname: {
      type: String,
      required: true,
      trim: true,
      // TODO: Add validation for shop name format
    },

    description: {
      type: String,
      // TODO: Add max length validation
    },

    // TODO: Add shop logo/banner URL
    // logo: String,
    // banner: String,

    // Products sold
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // TODO: Create Product model and setup references
      },
    ],

    // Shop contact information
    contact: {
      email: {
        type: String,
        // TODO: Add email validation
      },
      phonenumber: {
        type: String,
      },
    },

    // Shop's business address
    shopaddress: {
      street: String,
      city: String,
      postalcode: String,
      country: String,
    },

    // Seller's buying/billing address
    buyingaddress: {
      street: String,
      city: String,
      postalcode: String,
      country: String,
    },

    // Verification status
    isverified: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // Rejection reason (if shop was rejected)
    rejectionreason: {
      type: String,
      // TODO: Add rejection reason description
    },

    // Shop rating & reviews
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      // TODO: Add method to calculate from reviews
    },

    // TODO: Add total reviews count
    // TODO: Add follower count
    // TODO: Add shop policies (refund, return, etc.)
  },
  { timestamps: true },
);

const shopModel = mongoose.model("Shop", shopSchema);

module.exports = shopModel;
