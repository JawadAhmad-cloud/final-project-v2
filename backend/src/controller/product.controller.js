const productModel = require("../model/product.model");
const shopModel = require("../model/shop.model");
const { validationResult } = require("express-validator");

/**
 * Add Product Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.body - Request body
 * @param {String} req.body.name - Product name
 * @param {String} req.body.description - Product description
 * @param {Number} req.body.price - Product price
 * @param {String} req.body.category - Product category
 * @param {Number} req.body.totalStock - Total stock
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Creates a new product (seller only)
 */
async function addProduct(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const userId = req.user.id;
  const { name, description, price, category, totalStock } = req.body;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found. Please create a shop first.",
      });
    }

    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified before adding products",
      });
    }

    // Create new product
    const newProduct = new productModel({
      seller: shop._id,
      name,
      description,
      price,
      category,
      totalStock,
      availableStock: totalStock, // Initially all stock is available
      reservedStock: 0,
    });

    await newProduct.save();

    // Add product to shop's products array
    shop.products.push(newProduct._id);
    await shop.save();

    res.status(201).json({
      success: true,
      data: {
        productId: newProduct._id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        totalStock: newProduct.totalStock,
        availableStock: newProduct.availableStock,
        status: newProduct.status,
      },
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Seller Products Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @param {String} req.query.search - Search by product name
 * @param {String} req.query.category - Filter by category
 * @param {String} req.query.status - Filter by status (active, inactive, discontinued)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets all products for seller with pagination and filters
 */
async function getSellerProducts(req, res) {
  const userId = req.user.id;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified to access products",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const status = req.query.status || "";

    // Build filters
    let filters = { seller: shop._id };
    if (search) filters.name = { $regex: search, $options: "i" };
    if (category) filters.category = category;
    if (status) filters.status = status;

    // Get products
    const products = await productModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await productModel.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: "Products retrieved successfully",
    });
  } catch (error) {
    console.error("Get seller products error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Update Product Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.productId - Product ID to update
 * @param {Object} req.body - Update data
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Updates product information
 */
async function updateProduct(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const userId = req.user.id;
  const { productId } = req.params;
  const { name, description, price, category, status } = req.body;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified to update products",
      });
    }

    // Check if product belongs to seller
    const product = await productModel.findOne({
      _id: productId,
      seller: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found",
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (status) product.status = status;

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        status: product.status,
      },
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Delete Product Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.productId - Product ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Deletes a product
 */
async function deleteProduct(req, res) {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified to delete products",
      });
    }

    // Check if product belongs to seller
    const product = await productModel.findOneAndDelete({
      _id: productId,
      seller: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found",
      });
    }

    // Remove from shop's products array
    shop.products = shop.products.filter((id) => id.toString() !== productId);
    await shop.save();

    res.status(200).json({
      success: true,
      data: null,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Product Details Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware - seller only)
 * @param {String} req.params.productId - Product ID
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Gets detailed information about a product including reviews
 */
async function getProductDetails(req, res) {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Get product
    const product = await productModel.findOne({
      _id: productId,
      seller: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        totalStock: product.totalStock,
        availableStock: product.availableStock,
        reservedStock: product.reservedStock,
        images: product.images,
        rating: product.rating,
        reviewCount: product.reviewCount,
        status: product.status,
      },
      message: "Product details retrieved successfully",
    });
  } catch (error) {
    console.error("Get product details error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Toggle Product Active Status Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token
 * @param {String} req.params.productId - Product ID
 * @param {Object} req.body - Request body
 * @param {String} req.body.status - New status (active, inactive, discontinued)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Toggle product between active/inactive status
 */
async function toggleProductStatus(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const userId = req.user.id;
  const { productId } = req.params;
  const { status } = req.body;

  try {
    // Get seller's shop
    const shop = await shopModel.findOne({ seller: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Shop not found",
      });
    }

    // Check if shop is verified
    if (shop.isverified !== "verified") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your shop must be verified to toggle product status",
      });
    }

    // Check if product belongs to seller
    const product = await productModel.findOne({
      _id: productId,
      seller: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found",
      });
    }

    // Update status
    if (status) {
      product.status = status;
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        status: product.status,
        isActive: product.status === "active",
      },
      message: `Product status changed to ${product.status}`,
    });
  } catch (error) {
    console.error("Toggle product status error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  addProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getProductDetails,
  toggleProductStatus,
};
