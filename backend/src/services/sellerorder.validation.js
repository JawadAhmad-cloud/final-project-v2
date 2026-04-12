const { param } = require("express-validator");

/**
 * Accept Order Validation Rules
 */
const acceptOrderValidation = [
  param("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
];

/**
 * Reject Order Validation Rules
 */
const rejectOrderValidation = [
  param("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
];

/**
 * Complete Order Validation Rules
 */
const completeOrderValidation = [
  param("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
];

/**
 * Delete Order Validation Rules
 */
const deleteOrderValidation = [
  param("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
];

module.exports = {
  acceptOrderValidation,
  rejectOrderValidation,
  completeOrderValidation,
  deleteOrderValidation,
};
