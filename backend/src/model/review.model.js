const mongoose = require("mongoose");

/**
 * Review Schema
 * @description Stores product reviews from users
 * @typedef {Object} Review
 * @property {ObjectId} product - Reference to Product model
 * @property {ObjectId} user - Reference to User model (reviewer)
 * @property {ObjectId} order - Reference to Order model (proof of purchase)
 * @property {Number} rating - Review rating (1-5)
 * @property {String} title - Review title
 * @property {String} comment - Review comment/description
 * @property {Boolean} isVerifiedPurchase - Whether user purchased this product
 * @property {Number} helpful - Count of helpful votes
 * @property {Date} createdAt - Auto timestamp
 * @property {Date} updatedAt - Auto timestamp
 */

const reviewSchema = new mongoose.Schema(
  {
    // Product being reviewed
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // User who left the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order reference (proof of purchase)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      // TODO: Verify user purchased this product
    },

    // Review rating
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review content
    title: {
      type: String,
      required: true,
      trim: true,
      // TODO: Add max length validation
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      // TODO: Add max length validation
    },

    // Verified purchase flag
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      // TODO: Set to true if order exists and is completed
    },

    // Helpful votes
    helpful: {
      type: Number,
      default: 0,
      // TODO: Implement upvote system
    },

    // TODO: Add helpful votes array with user tracking to prevent duplicate votes
    // TODO: Add status (pending, approved, rejected) for review moderation
  },
  { timestamps: true },
);

// TODO: Create index on product and user for faster queries
// reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
