const cartModel = require("../model/cart.model");
const userModel = require("../model/user.model");
const { validationResult } = require("express-validator");

/**
 * Add Item to Cart Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.productId - Product ID to add
 * @param {Number} req.body.quantity - Quantity of product (default: 1)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Adds a product to user's cart or updates quantity if already exists
 */
async function addToCart(req, res) {
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
  const { productId, quantity = 1 } = req.body;

  try {
    // Find or create user's cart
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new cartModel({
        user: userId,
        items: [
          {
            product: productId,
            quantity: quantity,
          },
        ],
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId,
      );

      if (existingItem) {
        // Update quantity if product already exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          product: productId,
          quantity: quantity,
        });
      }
    }

    // TODO: Calculate total price based on product prices
    // TODO: Apply any active discounts/coupons

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      data: {
        cartId: cart._id,
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length,
      },
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Remove Item from Cart Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {String} req.params.itemId - Cart item ID to remove
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Removes a product from user's cart
 */
async function removeFromCart(req, res) {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Cart not found",
      });
    }

    // Find and remove item
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);

    // TODO: Recalculate total price

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      data: {
        cartId: cart._id,
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length,
      },
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Update Cart Item Quantity Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {String} req.params.itemId - Cart item ID to update
 * @param {Object} req.body - Request body
 * @param {Number} req.body.quantity - New quantity
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Updates quantity of an item in cart
 */
async function updateCartItemQuantity(req, res) {
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
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Cart not found",
      });
    }

    // Find item and update quantity
    const item = cart.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Item not found in cart",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Quantity must be greater than 0",
      });
    }

    item.quantity = quantity;

    // TODO: Recalculate total price

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      data: {
        cartId: cart._id,
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length,
      },
      message: "Cart item quantity updated successfully",
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Cart Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Retrieves user's cart with all items
 */
async function getCart(req, res) {
  const userId = req.user.id;

  try {
    let cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product");

    if (!cart) {
      // Return empty cart
      return res.status(200).json({
        success: true,
        data: {
          cartId: null,
          items: [],
          totalPrice: 0,
          itemCount: 0,
        },
        message: "Cart is empty",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        cartId: cart._id,
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length,
      },
      message: "Cart retrieved successfully",
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Clear Cart Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Clears all items from user's cart
 */
async function clearCart(req, res) {
  const userId = req.user.id;

  try {
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      data: null,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCart,
  clearCart,
};
