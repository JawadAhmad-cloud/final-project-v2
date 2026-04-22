const mongoose = require("mongoose");

/**
 * Payment Schema
 * Stores payment and checkout information for orders
 */

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Payment amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Platform fee deducted
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Amount seller receives after platform fee
    sellerAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Payment status: pending, paid, failed, refunded
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Payment method: card, bank_transfer, etc
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "wallet"],
      default: "card",
    },

    // Transaction ID from payment gateway
    transactionId: {
      type: String,
    },

    // Checkout data (stored for invoice generation)
    checkoutData: {
      cardName: String,
      cardNumber: String, // Masked for security
      expiryDate: String,
      // CVV not stored for security reasons
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    paidAt: {
      type: Date,
    },

    // When payment was distributed to seller
    distributedToSeller: {
      type: Boolean,
      default: false,
    },

    distributedAt: {
      type: Date,
    },

    // Refund info if applicable
    refundInfo: {
      amount: Number,
      date: Date,
      reason: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
