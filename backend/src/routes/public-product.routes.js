const express = require("express");
const productController = require("../controller/product.controller");

const routes = express.Router();

/**
 * GET /
 * @description Get all products (public - no authentication required)
 * @param {Object} req.query - Query parameters
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 20)
 * @param {String} req.query.search - Search by product name
 * @param {String} req.query.category - Filter by category
 * @returns {Object} {success: Boolean, data: Array, message: String}
 */
routes.get("/", async (req, res) => {
  try {
    const Product = require("../model/product.model");
    const { search = "", category = "", page = 1, limit = 20 } = req.query;

    let query = { status: "active" }; // Only show active products

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .select(
        "_id name description price category totalStock seller rating createdAt",
      )
      .populate("seller", "shopname")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      message: "Products retrieved successfully",
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /:productId
 * @description Get product details by ID (public)
 * @param {String} req.params.productId - Product ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.get("/:productId", async (req, res) => {
  try {
    const Product = require("../model/product.model");
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("seller", "shopname shopaddress contact rating")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "firstname lastname",
        },
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
      data: product,
      message: "Product retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = routes;
