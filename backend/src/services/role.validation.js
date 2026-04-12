const { body } = require("express-validator");

/**
 * Set Role Validation Rules
 */
const setRoleValidation = [
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["user", "seller"])
    .withMessage("Role must be either 'user' or 'seller'"),
];

module.exports = {
  setRoleValidation,
};
