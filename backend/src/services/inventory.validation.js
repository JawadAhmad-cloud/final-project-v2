const { body, param } = require("express-validator");

/**
 * Update Product Stock Validation Rules
 */
const updateProductStockValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("totalStock")
    .notEmpty()
    .withMessage("Total stock is required")
    .isInt({ min: 0 })
    .withMessage("Total stock must be a non-negative integer"),
];

module.exports = {
  updateProductStockValidation,
};
