const ImageKit = require("imagekit");

/**
 * ImageKit Product Service
 * @description Service for uploading product images to ImageKit
 * Supports dynamic multiple image uploads (1, 2, 3, or more product images)
 * Automatically creates /product folder if it doesn't exist
 */

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Ensure Product Folder Exists
 * @description Creates /product folder in ImageKit if it doesn't exist
 * @returns {Promise<Object>} Folder creation response
 */
async function ensureProductFolder() {
  try {
    // List files to check if /product folder exists
    const files = await imagekit.listFiles({
      path: "/product",
      limit: 1,
    });

    console.log("Product folder exists");
    return { success: true, folderExists: true };
  } catch (error) {
    // Folder doesn't exist, create it
    try {
      const folderResponse = await imagekit.createFolder({
        folderName: "product",
        parentFolderPath: "/",
      });

      console.log("Product folder created successfully");
      return { success: true, folderCreated: true };
    } catch (createError) {
      console.log(
        "Product folder may already exist or error creating:",
        createError.message,
      );
      return { success: true }; // Continue even if folder exists
    }
  }
}

/**
 * Upload Single Product Image
 * @description Upload a single product image to /product folder
 * @param {File|Buffer} fileContent - File content (from multer or buffer)
 * @param {String} productId - Product ID
 * @param {Number} imageIndex - Image index/number (1, 2, 3, etc.)
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     url: String,
 *     fileId: String,
 *     fileName: String,
 *     path: String,
 *     height: Number,
 *     width: Number
 *   },
 *   message: String
 * }
 */
async function uploadProductImage(fileContent, productId, imageIndex = 1) {
  try {
    // Ensure folder exists
    await ensureProductFolder();

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `product_${productId}_image${imageIndex}_${timestamp}.jpg`;

    // Upload to ImageKit
    const response = await imagekit.upload({
      file: fileContent,
      fileName: uniqueFileName,
      folder: "/product",
      useUniqueFileName: false, // Use our custom name
      tags: [
        "product",
        "image",
        `productId_${productId}`,
        `image_${imageIndex}`,
      ],
      customMetadata: {
        productId: productId,
        imageIndex: imageIndex,
        type: "product",
      },
    });

    return {
      success: true,
      data: {
        url: response.url,
        fileId: response.fileId,
        fileName: response.name,
        path: response.filePath,
        height: response.height,
        width: response.width,
        imageIndex: imageIndex,
      },
      message: `Product image ${imageIndex} uploaded successfully`,
    };
  } catch (error) {
    console.error(`Product image ${imageIndex} upload error:`, error);
    return {
      success: false,
      data: null,
      message: `Failed to upload product image ${imageIndex}`,
      error: error.message,
      imageIndex: imageIndex,
    };
  }
}

/**
 * Upload Multiple Product Images (Dynamic)
 * @description Upload multiple product images at once
 * Dynamically handles any number of images (1, 2, 3, or more)
 * @param {Array<File|Buffer>} fileArray - Array of file contents
 * @param {String} productId - Product ID
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     uploadedImages: Array<Object>,
 *     failedImages: Array<Object>,
 *     totalAttempted: Number,
 *     totalUploaded: Number,
 *     totalFailed: Number
 *   },
 *   message: String
 * }
 *
 * @example
 * // Upload 3 product images
 * const files = [file1Buffer, file2Buffer, file3Buffer];
 * const result = await uploadProductImages(files, "productId123");
 *
 * // Upload 1 product image
 * const result = await uploadProductImages([singleFile], "productId123");
 *
 * // Upload 5 product images
 * const result = await uploadProductImages(filesArray, "productId123");
 */
async function uploadProductImages(fileArray, productId) {
  try {
    // Validate input
    if (!Array.isArray(fileArray) || fileArray.length === 0) {
      return {
        success: false,
        data: null,
        message: "No files provided for upload",
      };
    }

    if (!productId) {
      return {
        success: false,
        data: null,
        message: "Product ID is required",
      };
    }

    // Ensure folder exists
    await ensureProductFolder();

    const uploadedImages = [];
    const failedImages = [];

    // Upload each file with index
    for (let i = 0; i < fileArray.length; i++) {
      const imageIndex = i + 1; // Start from 1 instead of 0
      const fileContent = fileArray[i];

      try {
        const timestamp = Date.now();
        const uniqueFileName = `product_${productId}_image${imageIndex}_${timestamp}.jpg`;

        // Upload to ImageKit
        const response = await imagekit.upload({
          file: fileContent,
          fileName: uniqueFileName,
          folder: "/product",
          useUniqueFileName: false,
          tags: [
            "product",
            "image",
            `productId_${productId}`,
            `image_${imageIndex}`,
          ],
          customMetadata: {
            productId: productId,
            imageIndex: imageIndex,
            type: "product",
          },
        });

        uploadedImages.push({
          imageIndex: imageIndex,
          url: response.url,
          fileId: response.fileId,
          fileName: response.name,
          path: response.filePath,
          height: response.height,
          width: response.width,
        });

        console.log(`✓ Product image ${imageIndex} uploaded successfully`);
      } catch (error) {
        console.error(
          `✗ Product image ${imageIndex} upload failed:`,
          error.message,
        );

        failedImages.push({
          imageIndex: imageIndex,
          error: error.message,
        });
      }
    }

    // Return detailed response
    const allSuccess = failedImages.length === 0;

    return {
      success: allSuccess,
      data: {
        uploadedImages: uploadedImages,
        failedImages: failedImages,
        totalAttempted: fileArray.length,
        totalUploaded: uploadedImages.length,
        totalFailed: failedImages.length,
        productId: productId,
      },
      message: allSuccess
        ? `All ${uploadedImages.length} product images uploaded successfully`
        : `Uploaded ${uploadedImages.length} image(s), ${failedImages.length} failed`,
    };
  } catch (error) {
    console.error("Product images batch upload error:", error);
    return {
      success: false,
      data: null,
      message: "Failed to upload product images",
      error: error.message,
    };
  }
}

/**
 * Delete Product Image
 * @description Delete product image by file ID
 * @param {String} fileId - ImageKit file ID
 * @param {String} productId - Product ID (optional, for logging)
 * @returns {Promise<Object>} {success: Boolean, message: String}
 */
async function deleteProductImage(fileId, productId = null) {
  try {
    await imagekit.deleteFile(fileId);

    return {
      success: true,
      message: `Product image deleted successfully`,
      fileId: fileId,
    };
  } catch (error) {
    console.error("Product image deletion error:", error);
    return {
      success: false,
      message: "Failed to delete product image",
      fileId: fileId,
      error: error.message,
    };
  }
}

/**
 * Delete Multiple Product Images
 * @description Delete multiple product images by file IDs
 * @param {Array<String>} fileIds - Array of ImageKit file IDs
 * @param {String} productId - Product ID (optional, for logging)
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     deletedCount: Number,
 *     failedCount: Number
 *   },
 *   message: String
 * }
 */
async function deleteProductImages(fileIds, productId = null) {
  try {
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return {
        success: false,
        message: "No file IDs provided for deletion",
      };
    }

    let deletedCount = 0;
    let failedCount = 0;

    for (const fileId of fileIds) {
      try {
        await imagekit.deleteFile(fileId);
        deletedCount++;
        console.log(`✓ Image ${fileId} deleted`);
      } catch (error) {
        failedCount++;
        console.error(`✗ Failed to delete image ${fileId}:`, error.message);
      }
    }

    return {
      success: failedCount === 0,
      data: {
        deletedCount: deletedCount,
        failedCount: failedCount,
      },
      message: `Deleted ${deletedCount} image(s), ${failedCount} failed`,
    };
  } catch (error) {
    console.error("Product images batch deletion error:", error);
    return {
      success: false,
      message: "Failed to delete product images",
      error: error.message,
    };
  }
}

/**
 * Update Product Image
 * @description Delete old product image and upload new one
 * @param {String} oldFileId - Old image file ID (for deletion)
 * @param {File|Buffer} fileContent - New file content
 * @param {String} productId - Product ID
 * @param {Number} imageIndex - Image index/number (1, 2, 3, etc.)
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     url: String,
 *     fileId: String,
 *     fileName: String,
 *     path: String,
 *     imageIndex: Number,
 *     oldFileIdDeleted: String
 *   },
 *   message: String
 * }
 */
async function updateProductImage(
  oldFileId,
  fileContent,
  productId,
  imageIndex = 1,
) {
  try {
    // First, upload new image
    const newImageResult = await uploadProductImage(
      fileContent,
      productId,
      imageIndex,
    );

    if (!newImageResult.success) {
      return newImageResult;
    }

    // Then delete old image (don't fail if deletion fails)
    if (oldFileId) {
      try {
        await deleteProductImage(oldFileId, productId);
        console.log(`✓ Old image ${oldFileId} deleted successfully`);
      } catch (deleteError) {
        console.error(
          `⚠ Warning: Could not delete old image ${oldFileId}:`,
          deleteError.message,
        );
        // Continue even if old file deletion fails
      }
    }

    return {
      success: true,
      data: {
        ...newImageResult.data,
        oldFileIdDeleted: oldFileId || null,
      },
      message: `Product image ${imageIndex} updated successfully`,
    };
  } catch (error) {
    console.error(`Product image ${imageIndex} update error:`, error);
    return {
      success: false,
      data: null,
      message: `Failed to update product image ${imageIndex}`,
      error: error.message,
      imageIndex: imageIndex,
    };
  }
}

/**
 * Update Multiple Product Images (Dynamic)
 * @description Update multiple product images at once
 * Old images are deleted, new ones are uploaded
 * Dynamically handles any number of images
 * @param {Array<Object>} imageUpdates - Array of update objects [{oldFileId, fileContent, imageIndex}, ...]
 * @param {String} productId - Product ID
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     updatedImages: Array<Object>,
 *     failedImages: Array<Object>,
 *     totalAttempted: Number,
 *     totalUpdated: Number,
 *     totalFailed: Number
 *   },
 *   message: String
 * }
 *
 * @example
 * const imageUpdates = [
 *   { oldFileId: "file1Id", fileContent: newFile1, imageIndex: 1 },
 *   { oldFileId: "file2Id", fileContent: newFile2, imageIndex: 2 }
 * ];
 * const result = await updateProductImages(imageUpdates, "productId123");
 */
async function updateProductImages(imageUpdates, productId) {
  try {
    // Validate input
    if (!Array.isArray(imageUpdates) || imageUpdates.length === 0) {
      return {
        success: false,
        data: null,
        message: "No images provided for update",
      };
    }

    if (!productId) {
      return {
        success: false,
        data: null,
        message: "Product ID is required",
      };
    }

    // Ensure folder exists
    await ensureProductFolder();

    const updatedImages = [];
    const failedImages = [];

    // Update each image
    for (let i = 0; i < imageUpdates.length; i++) {
      const { oldFileId, fileContent, imageIndex = i + 1 } = imageUpdates[i];

      try {
        const timestamp = Date.now();
        const uniqueFileName = `product_${productId}_image${imageIndex}_${timestamp}.jpg`;

        // Upload new image
        const response = await imagekit.upload({
          file: fileContent,
          fileName: uniqueFileName,
          folder: "/product",
          useUniqueFileName: false,
          tags: [
            "product",
            "image",
            `productId_${productId}`,
            `image_${imageIndex}`,
          ],
          customMetadata: {
            productId: productId,
            imageIndex: imageIndex,
            type: "product",
          },
        });

        updatedImages.push({
          imageIndex: imageIndex,
          url: response.url,
          fileId: response.fileId,
          fileName: response.name,
          path: response.filePath,
          height: response.height,
          width: response.width,
          oldFileIdDeleted: oldFileId || null,
        });

        // Delete old image if provided (don't fail if it fails)
        if (oldFileId) {
          try {
            await imagekit.deleteFile(oldFileId);
            console.log(`✓ Image ${imageIndex} updated, old file deleted`);
          } catch (deleteError) {
            console.log(
              `⚠ Image ${imageIndex} updated, but old file delete failed`,
            );
          }
        }
      } catch (error) {
        console.error(`✗ Image ${imageIndex} update failed:`, error.message);

        failedImages.push({
          imageIndex: imageIndex,
          error: error.message,
        });
      }
    }

    // Return detailed response
    const allSuccess = failedImages.length === 0;

    return {
      success: allSuccess,
      data: {
        updatedImages: updatedImages,
        failedImages: failedImages,
        totalAttempted: imageUpdates.length,
        totalUpdated: updatedImages.length,
        totalFailed: failedImages.length,
        productId: productId,
      },
      message: allSuccess
        ? `All ${updatedImages.length} product image(s) updated successfully`
        : `Updated ${updatedImages.length} image(s), ${failedImages.length} failed`,
    };
  } catch (error) {
    console.error("Product images batch update error:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update product images",
      error: error.message,
    };
  }
}

/**
 * Get Product Images by Product ID
 * @description List all images for a specific product
 * @param {String} productId - Product ID
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: Array<Object>,
 *   message: String
 * }
 */
async function getProductImages(productId) {
  try {
    const files = await imagekit.listFiles({
      path: "/product",
      searchQuery: `name like "%${productId}%"`,
      limit: 100,
    });

    // Filter and sort by image index
    const productImages = files
      .filter((file) => file.name.includes(`product_${productId}`))
      .sort((a, b) => {
        // Extract image index from filename
        const indexA = parseInt(a.name.match(/image(\d+)/)?.[1] || 0);
        const indexB = parseInt(b.name.match(/image(\d+)/)?.[1] || 0);
        return indexA - indexB;
      })
      .map((file, index) => ({
        imageIndex: index + 1,
        url: file.url,
        fileId: file.fileId,
        fileName: file.name,
        path: file.filePath,
        size: file.size,
        createdAt: file.createdAt,
      }));

    return {
      success: true,
      data: productImages,
      message: `Found ${productImages.length} image(s) for product`,
    };
  } catch (error) {
    console.error("Get product images error:", error);
    return {
      success: false,
      data: [],
      message: "Failed to retrieve product images",
      error: error.message,
    };
  }
}

module.exports = {
  ensureProductFolder,
  uploadProductImage,
  uploadProductImages, // Dynamic multiple uploads
  updateProductImage, // Update single product image
  updateProductImages, // Update multiple product images dynamically
  deleteProductImage,
  deleteProductImages,
  getProductImages,
};
