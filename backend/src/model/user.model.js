const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    phonenumber: {
      type: String,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    dob: {
      type: Date,
    },

    // Role Management (user, seller, admin)
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    // Address Information
    addresses: [
      {
        street: String,
        city: String,
        postalcode: String,
        country: String,
        isdefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // User References
    favourite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Favourite",
      // TODO: Will be created automatically when user first adds to favourite
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      // TODO: Will be created automatically when user first adds to cart
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // Seller Information (if role is seller)
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },

    // Account Status
    isactive: {
      type: Boolean,
      default: true,
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    verificationtoken: String,
    verificationtokenexpiry: Date,

    // Account Preferences
    currency: {
      type: String,
      default: "USD",
    },
    language: {
      type: String,
      default: "en",
    },
  },
  { timestamps: true },
);
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
