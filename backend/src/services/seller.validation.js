const { body } = require("express-validator");

/**
 * Create Shop Validation Rules
 */
const createShopValidation = [
  body("shopname")
    .trim()
    .notEmpty()
    .withMessage("Shop name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Shop name must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Shop description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Shop email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phonenumber")
    .trim()
    .notEmpty()
    .withMessage("Shop phone number is required")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone number must be 10-15 digits"),

  // Shop address validation
  body("shopaddress.street")
    .trim()
    .notEmpty()
    .withMessage("Shop street address is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be between 5 and 100 characters"),

  body("shopaddress.city")
    .trim()
    .notEmpty()
    .withMessage("Shop city is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("shopaddress.postalcode")
    .trim()
    .notEmpty()
    .withMessage("Shop postal code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("shopaddress.country")
    .trim()
    .notEmpty()
    .withMessage("Shop country is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  // Buying address validation
  body("buyingaddress.street")
    .trim()
    .notEmpty()
    .withMessage("Buying street address is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be between 5 and 100 characters"),

  body("buyingaddress.city")
    .trim()
    .notEmpty()
    .withMessage("Buying city is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("buyingaddress.postalcode")
    .trim()
    .notEmpty()
    .withMessage("Buying postal code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("buyingaddress.country")
    .trim()
    .notEmpty()
    .withMessage("Buying country is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
];

/**
 * Update Shop Validation Rules
 */
const updateShopValidation = [
  body("shopname")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Shop name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phonenumber")
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone number must be 10-15 digits"),

  // Shop address optional validation
  body("shopaddress.street")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be between 5 and 100 characters"),

  body("shopaddress.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("shopaddress.postalcode")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("shopaddress.country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  // Buying address optional validation
  body("buyingaddress.street")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be between 5 and 100 characters"),

  body("buyingaddress.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("buyingaddress.postalcode")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("buyingaddress.country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
];

module.exports = {
  createShopValidation,
  updateShopValidation,
};
