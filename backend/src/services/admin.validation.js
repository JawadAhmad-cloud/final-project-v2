const { body, param } = require("express-validator");

/**
 * Reject Shop Validation Rules
 */
const rejectShopValidation = [
  param("shopId")
    .notEmpty()
    .withMessage("Shop ID is required")
    .isMongoId()
    .withMessage("Invalid shop ID"),

  body("rejectionreason")
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Rejection reason must be between 10 and 500 characters"),
];

/**
 * Verify Shop Validation Rules
 */
const verifyShopValidation = [
  param("shopId")
    .notEmpty()
    .withMessage("Shop ID is required")
    .isMongoId()
    .withMessage("Invalid shop ID"),
];

/**
 * Delete Shop Validation Rules
 */
const deleteShopValidation = [
  param("shopId")
    .notEmpty()
    .withMessage("Shop ID is required")
    .isMongoId()
    .withMessage("Invalid shop ID"),
];

/**
 * Bulk Verify Shops Validation Rules
 */
const bulkVerifyShopsValidation = [
  body("shopIds")
    .isArray({ min: 1 })
    .withMessage("shopIds must be an array with at least one item"),

  body("shopIds.*").isMongoId().withMessage("Each shop ID must be valid"),
];

module.exports = {
  rejectShopValidation,
  verifyShopValidation,
  deleteShopValidation,
  bulkVerifyShopsValidation,
};
