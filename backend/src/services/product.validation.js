const { body, param } = require("express-validator");

/**
 * Add Product Validation Rules
 */
const addProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("totalStock")
    .notEmpty()
    .withMessage("Total stock is required")
    .isInt({ min: 0 })
    .withMessage("Total stock must be a non-negative integer"),
];

/**
 * Update Product Validation Rules
 */
const updateProductValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category").optional().trim(),

  body("status")
    .optional()
    .isIn(["active", "inactive", "discontinued"])
    .withMessage("Status must be active, inactive, or discontinued"),
];

/**
 * Delete Product Validation Rules
 */
const deleteProductValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

/**
 * Get Product Details Validation Rules
 */
const getProductDetailsValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

/**
 * Toggle Product Status Validation Rules
 */
const toggleProductStatusValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["active", "inactive", "discontinued"])
    .withMessage("Status must be one of: active, inactive, discontinued"),
];

module.exports = {
  addProductValidation,
  updateProductValidation,
  deleteProductValidation,
  getProductDetailsValidation,
  toggleProductStatusValidation,
};
