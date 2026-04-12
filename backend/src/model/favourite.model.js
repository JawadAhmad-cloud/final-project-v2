const mongoose = require("mongoose");

/**
 * Favourite Schema
 * @description Stores favourite items for users (any user can add items to favourites)
 * @typedef {Object} Favourite
 * @property {ObjectId} user - Reference to User model
 * @property {Array} products - Array of product references
 * @property {Date} createdAt - Auto timestamp
 * @property {Date} updatedAt - Auto timestamp
 */

const favouriteSchema = new mongoose.Schema(
  {
    // User who owns this favourite list
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Products in favourite list
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // TODO: Create Product model and setup references
      },
    ],

    // TODO: Add favourite metadata (like item count, last modified, etc.)
  },
  { timestamps: true },
);

const favouriteModel = mongoose.model("Favourite", favouriteSchema);

module.exports = favouriteModel;
