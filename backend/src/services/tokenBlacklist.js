/**
 * Token Blacklist Service
 * Manages invalidated tokens to prevent their reuse
 */

// In-memory blacklist (replace with Redis for production)
let tokenBlacklist = new Set();

/**
 * Add token to blacklist
 * @param {String} token - JWT token to blacklist
 */
function blacklistToken(token) {
  tokenBlacklist.add(token);
  // In production, save to Redis with expiration based on token exp
}

/**
 * Check if token is blacklisted
 * @param {String} token - JWT token to check
 * @returns {Boolean} True if token is blacklisted
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * Clear a token from blacklist
 * @param {String} token - JWT token to remove
 */
function removeFromBlacklist(token) {
  tokenBlacklist.delete(token);
}

/**
 * Clear entire blacklist
 */
function clearBlacklist() {
  tokenBlacklist.clear();
}

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  removeFromBlacklist,
  clearBlacklist,
};
