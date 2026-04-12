const { body, param } = require("express-validator");

/**
 * Add to Cart Validation Rules
 */
const addToCartValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

/**
 * Remove from Cart Validation Rules
 */
const removeFromCartValidation = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .isMongoId()
    .withMessage("Invalid item ID"),
];

/**
 * Update Cart Item Quantity Validation Rules
 */
const updateCartQuantityValidation = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .isMongoId()
    .withMessage("Invalid item ID"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

module.exports = {
  addToCartValidation,
  removeFromCartValidation,
  updateCartQuantityValidation,
};
