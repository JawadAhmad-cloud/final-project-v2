const express = require("express");
const multer = require("multer");
const productController = require("../controller/product.controller");
const {
  addProductValidation,
  updateProductValidation,
  deleteProductValidation,
  getProductDetailsValidation,
  toggleProductStatusValidation,
} = require("../services/product.validation");

const upload = multer({ storage: multer.memoryStorage() });
const routes = express.Router();

/**
 * POST /
 * @description Add a new product (seller only)
 * @param {Object} req.body - Product information
 * @param {String} req.body.name - Product name (required)
 * @param {String} req.body.description - Product description (required)
 * @param {Number} req.body.price - Product price (required)
 * @param {String} req.body.category - Product category (required)
 * @param {Number} req.body.totalStock - Total stock (required)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.post("/", addProductValidation, productController.addProduct);

/**
 * POST /upload-images
 * @description Upload seller product images to ImageKit before product creation
 * @param {Array<File>} req.files - Up to 3 product image files (main, side1, side2)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.post(
  "/upload-images",
  upload.array("images", 3),
  productController.uploadProductImages,
);

/**
 * GET /
 * @description Get all products for seller with pagination and filters
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.search - Search by product name
 * @param {String} req.query.category - Filter by category
 * @param {String} req.query.status - Filter by status (active, inactive, discontinued)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get("/", productController.getSellerProducts);

/**
 * GET /:productId
 * @description Get product details
 * @param {String} req.params.productId - Product ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.get(
  "/:productId",
  getProductDetailsValidation,
  productController.getProductDetails,
);

/**
 * PUT /:productId
 * @description Update product information
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.body - Update data (all optional)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.put(
  "/:productId",
  updateProductValidation,
  productController.updateProduct,
);

/**
 * DELETE /:productId
 * @description Delete a product
 * @param {String} req.params.productId - Product ID
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.delete(
  "/:productId",
  deleteProductValidation,
  productController.deleteProduct,
);

/**
 * PUT /:productId/status
 * @description Toggle product status (active, inactive, discontinued)
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.body - Status data
 * @param {String} req.body.status - Status (active, inactive, discontinued)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @middleware Authentication required, Role: seller
 */
routes.put(
  "/:productId/status",
  toggleProductStatusValidation,
  productController.toggleProductStatus,
);

module.exports = routes;
