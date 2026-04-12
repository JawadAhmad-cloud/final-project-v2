const mongoose = require("mongoose");

/**
 * Product Schema
 * @description Stores product information with inventory management
 * @typedef {Object} Product
 * @property {ObjectId} seller - Reference to Shop model
 * @property {String} name - Product name
 * @property {String} description - Product description
 * @property {Number} price - Product price
 * @property {String} category - Product category
 * @property {Number} totalStock - Total available stock
 * @property {Number} availableStock - Available for purchase
 * @property {Number} reservedStock - Reserved from orders
 * @property {Array} images - Product images (main, side1, side2)
 * @property {Number} rating - Average product rating
 * @property {String} status - Product status (active, inactive, discontinued)
 * @property {Date} createdAt - Auto timestamp
 * @property {Date} updatedAt - Auto timestamp
 */

const productSchema = new mongoose.Schema(
  {
    // Seller/Shop who owns this product
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // Product basic info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      // TODO: Add max length validation
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      // TODO: Create category model and reference it
    },

    // Stock management
    totalStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      // TODO: Auto calculate as totalStock - reservedStock
    },

    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      // TODO: Auto update when orders are placed/cancelled
    },

    // Product images
    images: {
      main: {
        type: String,
        // TODO: Add main product image URL
      },
      side1: {
        type: String,
        // TODO: Add side view 1 image URL
      },
      side2: {
        type: String,
        // TODO: Add side view 2 image URL
      },
    },

    // Product rating & reviews
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      // TODO: Auto calculate from reviews
    },

    reviewCount: {
      type: Number,
      default: 0,
      // TODO: Auto increment when review is added
    },

    // Product status
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },

    // TODO: Add tags/keywords for search
    // TODO: Add SKU for inventory tracking
    // TODO: Add discount/promotion tracking
  },
  { timestamps: true },
);

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
