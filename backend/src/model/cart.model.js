const mongoose = require("mongoose");

/**
 * Cart Schema
 * @description Stores shopping cart items for users
 * @typedef {Object} Cart
 * @property {ObjectId} user - Reference to User model
 * @property {Array} items - Array of cart items with product and quantity
 * @property {Number} totalPrice - Total price of all items // TODO: Calculate automatically
 * @property {Date} createdAt - Auto timestamp
 * @property {Date} updatedAt - Auto timestamp
 */

const cartSchema = new mongoose.Schema(
  {
    // User who owns this cart
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Cart items
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // TODO: Create Product model and setup references
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        // TODO: Store price snapshot for historical tracking
        // price: Number,
      },
    ],

    // Cart total
    totalPrice: {
      type: Number,
      default: 0,
      // TODO: Add validation and automatic calculation
    },

    // TODO: Add coupon/discount tracking
    // TODO: Add estimated shipping info
  },
  { timestamps: true },
);

const cartModel = mongoose.model("Cart", cartSchema);

module.exports = cartModel;
