const favouriteModel = require("../model/favourite.model");
const { validationResult } = require("express-validator");

/**
 * Add to Favourite Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} req.body - Request body
 * @param {String} req.body.productId - Product ID to add to favourite
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Adds a product to user's favourite list
 */
async function addToFavourite(req, res) {
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
  const { productId } = req.body;

  try {
    // Find or create user's favourite list
    let favourite = await favouriteModel.findOne({ user: userId });

    if (!favourite) {
      // Create new favourite list if doesn't exist
      favourite = new favouriteModel({
        user: userId,
        products: [productId],
      });
    } else {
      // Check if product already in favourite
      if (favourite.products.includes(productId)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Product already in favourites",
        });
      }

      // Add product to favourite
      favourite.products.push(productId);
    }

    await favourite.save();

    // Populate product details for response
    await favourite.populate("products");

    res.status(200).json({
      success: true,
      data: {
        favouriteId: favourite._id,
        products: favourite.products,
        itemCount: favourite.products.length,
      },
      message: "Product added to favourites successfully",
    });
  } catch (error) {
    console.error("Add to favourite error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Remove from Favourite Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {String} req.params.productId - Product ID to remove
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Removes a product from user's favourite list
 */
async function removeFromFavourite(req, res) {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const favourite = await favouriteModel.findOne({ user: userId });

    if (!favourite) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Favourite list not found",
      });
    }

    // Check if product exists in favourite
    const productIndex = favourite.products.findIndex(
      (id) => id.toString() === productId,
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Product not found in favourites",
      });
    }

    // Remove product from favourite
    favourite.products.splice(productIndex, 1);
    await favourite.save();

    // Populate product details for response
    await favourite.populate("products");

    res.status(200).json({
      success: true,
      data: {
        favouriteId: favourite._id,
        products: favourite.products,
        itemCount: favourite.products.length,
      },
      message: "Product removed from favourites successfully",
    });
  } catch (error) {
    console.error("Remove from favourite error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get Favourites Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: Object, message: String}
 * @description Retrieves user's favourite list with all products
 */
async function getFavourites(req, res) {
  const userId = req.user.id;

  try {
    let favourite = await favouriteModel
      .findOne({ user: userId })
      .populate("products");

    if (!favourite) {
      // Return empty favourite list
      return res.status(200).json({
        success: true,
        data: {
          favouriteId: null,
          products: [],
          itemCount: 0,
        },
        message: "Favourite list is empty",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        favouriteId: favourite._id,
        products: favourite.products,
        itemCount: favourite.products.length,
      },
      message: "Favourites retrieved successfully",
    });
  } catch (error) {
    console.error("Get favourites error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Clear Favourites Handler
 * @async
 * @param {Object} req - Express request object
 * @param {String} req.user.id - User ID from token (middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {success: Boolean, data: null, message: String}
 * @description Clears all products from user's favourite list
 */
async function clearFavourites(req, res) {
  const userId = req.user.id;

  try {
    let favourite = await favouriteModel.findOne({ user: userId });

    if (!favourite) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Favourite list not found",
      });
    }

    favourite.products = [];
    await favourite.save();

    res.status(200).json({
      success: true,
      data: null,
      message: "Favourite list cleared successfully",
    });
  } catch (error) {
    console.error("Clear favourites error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  addToFavourite,
  removeFromFavourite,
  getFavourites,
  clearFavourites,
};
