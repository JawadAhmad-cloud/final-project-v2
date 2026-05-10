const { ImageKit, toFile } = require("@imagekit/nodejs");

/**
 * ImageKit Shop Service
 * @description Service for uploading shop logo and banner images to ImageKit
 * Automatically creates /shop folder if it doesn't exist
 */

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function getUploadFileContent(fileInput, defaultFileName) {
  if (!fileInput) {
    return fileInput;
  }

  if (Buffer.isBuffer(fileInput)) {
    return toFile(fileInput, defaultFileName);
  }

  if (
    typeof fileInput === "object" &&
    fileInput !== null &&
    Buffer.isBuffer(fileInput.buffer)
  ) {
    return toFile(fileInput.buffer, fileInput.originalName || defaultFileName);
  }

  return fileInput;
}

/**
 * Ensure Shop Folder Exists
 * @description Creates /shop folder in ImageKit if it doesn't exist
 * @returns {Promise<Object>} Folder creation response
 */
async function ensureShopFolder() {
  try {
    // Try to create the folder if it does not exist
    const folderResponse = await imagekit.folders.create({
      folderName: "shop",
      parentFolderPath: "/",
    });

    console.log("Shop folder created successfully");
    return { success: true, folderCreated: true };
  } catch (error) {
    console.log(
      "Shop folder may already exist or error creating:",
      error.message,
    );
    return { success: true }; // Continue even if folder exists or cannot be created
  }
}

/**
 * Upload Shop Logo
 * @description Upload shop logo image to /shop folder
 * @param {File|Buffer} fileContent - File content (from multer or buffer)
 * @param {String} fileName - File name (e.g., "logo_shopId.jpg")
 * @param {String} shopId - Shop ID for naming
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     url: String,
 *     fileId: String,
 *     fileName: String,
 *     path: String
 *   },
 *   message: String
 * }
 */
async function uploadShopLogo(fileContent, fileName, shopId) {
  try {
    // Ensure folder exists
    await ensureShopFolder();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = fileName || `logo_${shopId}_${timestamp}.jpg`;
    const uploadFile = getUploadFileContent(fileContent, uniqueFileName);

    // Upload to ImageKit
    const response = await imagekit.files.upload({
      file: uploadFile,
      fileName: uniqueFileName,
      folder: "/shop",
      useUniqueFileName: false, // Use our custom name
      tags: ["shop", "logo", `shopId_${shopId}`],
      customMetadata: {
        shopId: shopId,
        type: "logo",
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
      },
      message: "Shop logo uploaded successfully",
    };
  } catch (error) {
    console.error("Shop logo upload error:", error);
    return {
      success: false,
      data: null,
      message: "Failed to upload shop logo",
      error: error.message,
    };
  }
}

/**
 * Upload Shop Banner
 * @description Upload shop banner image to /shop folder
 * @param {File|Buffer} fileContent - File content (from multer or buffer)
 * @param {String} fileName - File name (e.g., "banner_shopId.jpg")
 * @param {String} shopId - Shop ID for naming
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     url: String,
 *     fileId: String,
 *     fileName: String,
 *     path: String
 *   },
 *   message: String
 * }
 */
async function uploadShopBanner(fileContent, fileName, shopId) {
  try {
    // Ensure folder exists
    await ensureShopFolder();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = fileName || `banner_${shopId}_${timestamp}.jpg`;
    const uploadFile = getUploadFileContent(fileContent, uniqueFileName);

    // Upload to ImageKit
    const response = await imagekit.files.upload({
      file: uploadFile,
      fileName: uniqueFileName,
      folder: "/shop",
      useUniqueFileName: false, // Use our custom name
      tags: ["shop", "banner", `shopId_${shopId}`],
      customMetadata: {
        shopId: shopId,
        type: "banner",
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
      },
      message: "Shop banner uploaded successfully",
    };
  } catch (error) {
    console.error("Shop banner upload error:", error);
    return {
      success: false,
      data: null,
      message: "Failed to upload shop banner",
      error: error.message,
    };
  }
}

/**
 * Update Shop Logo
 * @description Delete old logo and upload new logo
 * @param {String} oldFileId - Old logo file ID (for deletion)
 * @param {File|Buffer} fileContent - New file content
 * @param {String} shopId - Shop ID
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     url: String,
 *     fileId: String,
 *     fileName: String,
 *     path: String,
 *     oldFileIdDeleted: String
 *   },
 *   message: String
 * }
 */
async function updateShopLogo(oldFileId, fileContent, shopId) {
  try {
    // First, upload new logo
    const newLogoResult = await uploadShopLogo(fileContent, null, shopId);

    if (!newLogoResult.success) {
      return newLogoResult;
    }

    // Then delete old logo (don't fail if deletion fails)
    if (oldFileId) {
      try {
        await deleteShopImage(oldFileId);
        console.log(`Old logo ${oldFileId} deleted successfully`);
      } catch (deleteError) {
        console.error(
          `Warning: Could not delete old logo ${oldFileId}:`,
          deleteError.message,
        );
        // Continue even if old file deletion fails
      }
    }

    return {
      success: true,
      data: {
        ...newLogoResult.data,
        oldFileIdDeleted: oldFileId || null,
      },
      message: "Shop logo updated successfully",
    };
  } catch (error) {
    console.error("Shop logo update error:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update shop logo",
      error: error.message,
    };
  }
}

/**
 * Update Shop Banner
 * @description Delete old banner and upload new banner
 * @param {String} oldFileId - Old banner file ID (for deletion)
 * @param {File|Buffer} fileContent - New file content
 * @param {String} shopId - Shop ID
 * @returns {Promise<Object>} {
 *   success: Boolean,
 *   data: {
 *     url: String,
 *     fileId: String,
 *     fileName: String,
 *     path: String,
 *     oldFileIdDeleted: String
 *   },
 *   message: String
 * }
 */
async function updateShopBanner(oldFileId, fileContent, shopId) {
  try {
    // First, upload new banner
    const newBannerResult = await uploadShopBanner(fileContent, null, shopId);

    if (!newBannerResult.success) {
      return newBannerResult;
    }

    // Then delete old banner (don't fail if deletion fails)
    if (oldFileId) {
      try {
        await deleteShopImage(oldFileId);
        console.log(`Old banner ${oldFileId} deleted successfully`);
      } catch (deleteError) {
        console.error(
          `Warning: Could not delete old banner ${oldFileId}:`,
          deleteError.message,
        );
        // Continue even if old file deletion fails
      }
    }

    return {
      success: true,
      data: {
        ...newBannerResult.data,
        oldFileIdDeleted: oldFileId || null,
      },
      message: "Shop banner updated successfully",
    };
  } catch (error) {
    console.error("Shop banner update error:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update shop banner",
      error: error.message,
    };
  }
}

/**
 * Delete Shop Image (Logo or Banner)
 * @description Delete shop image by file ID
 * @param {String} fileId - ImageKit file ID
 * @returns {Promise<Object>} {success: Boolean, message: String}
 */
async function deleteShopImage(fileId) {
  try {
    await imagekit.files.delete(fileId);

    return {
      success: true,
      message: "Shop image deleted successfully",
    };
  } catch (error) {
    console.error("Shop image deletion error:", error);
    return {
      success: false,
      message: "Failed to delete shop image",
      error: error.message,
    };
  }
}

module.exports = {
  ensureShopFolder,
  uploadShopLogo,
  uploadShopBanner,
  updateShopLogo,
  updateShopBanner,
  deleteShopImage,
};
