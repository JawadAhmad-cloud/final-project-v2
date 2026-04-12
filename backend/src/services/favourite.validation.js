const { body, param } = require("express-validator");

/**
 * Add to Favourite Validation Rules
 */
const addToFavouriteValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

/**
 * Remove from Favourite Validation Rules
 */
const removeFromFavouriteValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

module.exports = {
  addToFavouriteValidation,
  removeFromFavouriteValidation,
};
