const mongoose = require("mongoose");

/**
 * Order Schema
 * @description Stores order information for users with seller tracking
 * @typedef {Object} Order
 * @property {ObjectId} user - Reference to User model (buyer)
 * @property {ObjectId} seller - Reference to Shop model (seller)
 * @property {Array} items - Array of ordered items with product and quantity
 * @property {Object} shippingAddress - Delivery address information
 * @property {String} status - Current order status (pending, accepted, rejected, shipped, delivered, cancelled)
 * @property {String} sellerStatus - Seller acceptance status (pending, accepted, rejected, completed)
 * @property {Number} totalAmount - Total order amount
 * @property {String} paymentStatus - Payment status
 * @property {Date} createdAt - Auto timestamp
 * @property {Date} updatedAt - Auto timestamp
 */

const orderSchema = new mongoose.Schema(
  {
    // User who placed the order (buyer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Seller/Shop who receives the order
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // Ordered items
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        // TODO: Store product price at time of purchase
        // price: Number,
      },
    ],

    // Shipping information
    shippingAddress: {
      street: {
        type: String,
        // TODO: Validate address format
      },
      city: {
        type: String,
      },
      postalcode: {
        type: String,
      },
      country: {
        type: String,
      },
      phonenumber: {
        type: String,
      },
    },

    // Order status (buyer perspective)
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // Seller acceptance status (seller perspective)
    sellerStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },

    // Order totals
    totalAmount: {
      type: Number,
      required: true,
      // TODO: Add automatic calculation from items
    },

    // TODO: Add tax calculation
    // TODO: Add shipping cost
    // TODO: Add discount/coupon applied

    // Payment information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // TODO: Add payment method tracking
    // TODO: Add tracking number for shipments
    // TODO: Seller only gets paid when order is completed
  },
  { timestamps: true },
);

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
