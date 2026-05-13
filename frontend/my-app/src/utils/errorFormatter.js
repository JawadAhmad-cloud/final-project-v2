/**
 * Format error message from API response
 * @param {Error|Object} error - Error object from API
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  // If it's a string, return it
  if (typeof error === "string") {
    return error;
  }

  // If it has a message property
  if (error?.message) {
    return error.message;
  }

  // If it's from our API fetch utility
  if (error?.message) {
    return error.message;
  }

  // Generic fallback
  return "Something went wrong. Please try again.";
};

/**
 * Get user-friendly error message based on error type
 * @param {Error|Object} error - Error object
 * @param {string} defaultAction - Default action context (e.g., 'create order', 'accept order')
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyError = (error, defaultAction = "operation") => {
  const message = formatErrorMessage(error);

  // Common API errors
  if (message.includes("401") || message.includes("Unauthorized")) {
    return "Your session has expired. Please log in again.";
  }

  if (message.includes("403") || message.includes("Forbidden")) {
    return "You do not have permission to perform this action.";
  }

  if (message.includes("404") || message.includes("not found")) {
    return "The requested item could not be found.";
  }

  if (message.includes("422") || message.includes("Validation")) {
    return "Please check your information and try again.";
  }

  if (message.includes("500") || message.includes("Internal server")) {
    return "Server error occurred. Please try again later.";
  }

  if (message.includes("Network") || message.includes("fetch")) {
    return "Network connection error. Please check your internet.";
  }

  if (message.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // Return the original message if it's already user-friendly
  if (message && !message.includes("Error:") && !message.match(/^\d+/)) {
    return message;
  }

  return `Failed to ${defaultAction}. Please try again.`;
};
