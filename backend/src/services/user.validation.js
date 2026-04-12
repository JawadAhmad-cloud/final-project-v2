const { body, param } = require("express-validator");

/**
 * Complete Profile Validation Rules
 */
const completeProfileValidation = [
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("phonenumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone number must be 10-15 digits"),

  body("dob")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Please provide a valid date"),
];

/**
 * Add Address Validation Rules
 */
const addAddressValidation = [
  body("street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be between 5 and 100 characters"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("postalcode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  body("isdefault")
    .optional()
    .isBoolean()
    .withMessage("isdefault must be a boolean"),
];

/**
 * Update Address Validation Rules
 */
const updateAddressValidation = [
  param("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID"),

  body("street")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be between 5 and 100 characters"),

  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("postalcode")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  body("isdefault")
    .optional()
    .isBoolean()
    .withMessage("isdefault must be a boolean"),
];

/**
 * Delete Address Validation Rules
 */
const deleteAddressValidation = [
  param("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID"),
];

module.exports = {
  completeProfileValidation,
  addAddressValidation,
  updateAddressValidation,
  deleteAddressValidation,
};
