#Base url=http://localhost:5000/

#Admin routes

##admin shop realted routes

/\*\*

- GET /api/admin/shops/pending
- @description Get all pending shop verifications with pagination and search
- @param {Object} req.query - Query parameters
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 10)
- @param {String} req.query.search - Search by shop name (optional)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- GET /api/admin/shops
- @description Get all shops with filtering and pagination
- @param {Object} req.query - Query parameters
- @param {String} req.query.status - Filter by status (pending, verified, rejected)
- @param {String} req.query.search - Search by shop name
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 10)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- POST /api/admin/shops/:shopId/verify
- @description Verify a shop and set status to 'verified'
- @param {String} req.params.shopId - Shop ID to verify
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- POST /api/admin/shops/:shopId/reject
- @description Reject a shop with a reason
- @param {String} req.params.shopId - Shop ID to reject
- @param {Object} req.body - Rejection details
- @param {String} req.body.rejectionreason - Reason for rejection (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- POST /api/admin/shops/bulk-verify
- @description Bulk verify multiple shops at once
- @param {Object} req.body - Bulk operation data
- @param {Array} req.body.shopIds - Array of shop IDs to verify
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- DELETE /api/admin/shops/:shopId
- @description Delete a shop (admin only)
- @param {String} req.params.shopId - Shop ID to delete
- @returns {Object} {success: Boolean, data: null, message: String}
- @middleware Authentication required, Role: admin
  \*/

##admin management routes

/\*\*

- POST /api/admin/management/add-admin
- @description Add a new admin user (only existing admins can do this)
- @param {Object} req.body - New admin information
- @param {String} req.body.username - Username (required, 3-30 chars)
- @param {String} req.body.email - Email (required, valid email)
- @param {String} req.body.password - Password (required, 6+ chars with uppercase, lowercase, number)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- GET /api/admin/management/all-admins
- @description Get all admin users with pagination
- @param {Object} req.query - Query parameters
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 10)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: admin
  \*/

/\*\*

- DELETE /api/admin/management/remove-admin/:adminIdToRemove
- @description Remove admin privileges from a user
- @param {String} req.params.adminIdToRemove - Admin ID to remove (required)
- @returns {Object} {success: Boolean, data: null, message: String}
- @description User will be converted to 'user' role
- @middleware Authentication required, Role: admin
  \*/

#Analytics routes

##for the seller

/\*\*

- GET /api/seller/analytics/
- @description Get seller analytics including revenue, sales, and inventory stats
- @param {Object} req.query - Query parameters
- @param {String} req.query.period - Analytics period (week, month, year) (default: month)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @data {Number} totalRevenue - Total revenue for the period
- @data {Number} totalSales - Total number of completed orders
- @data {Number} averageOrderValue - Average order value
- @data {Object} inventorySummary - Inventory statistics
- @data {Array} lowStockAlerts - Products with low stock
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- GET /api/seller/analytics/trends
- @description Get revenue and order trends over time
- @param {Object} req.query - Query parameters
- @param {String} req.query.period - Aggregation period (day, week, month, year) (default: month)
- @returns {Object} {success: Boolean, data: Array, message: String}
- @data {Date} \_id - Date identifier
- @data {Number} revenue - Revenue for the period
- @data {Number} orders - Number of orders for the period
- @middleware Authentication required, Role: seller
  \*/

Auth Routes

/\*\*

- POST /api/auth/register
- @description User registration endpoint
- @param {Object} req.body - User registration data
- @param {String} req.body.username - Required, 3-30 characters
- @param {String} req.body.email - Required, valid email format
- @param {String} req.body.password - Required, min 6 characters with uppercase, lowercase, and number
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- POST /api/auth/login
- @description User login endpoint
- @param {Object} req.body - User login credentials
- @param {String} req.body.email - Required, valid email format
- @param {String} req.body.password - Required, min 6 characters
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- POST /api/auth/logout
- @description User logout endpoint
- @returns {Object} {success: Boolean, data: null, message: String}
  \*/

/\*\*

- POST /api/auth/set-role
- @description Set user role after registration (user or seller)
- @param {Object} req.body - Role selection data
- @param {String} req.body.role - Either 'user' or 'seller'
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- POST /api/auth/admin-login
- @description Admin login endpoint (separate from regular user login)
- @param {Object} req.body - Admin login credentials
- @param {String} req.body.email - Required, valid email format
- @param {String} req.body.password - Required, min 6 characters
- @returns {Object} {success: Boolean, data: Object, message: String}
- @description Only users with admin role can login here
  \*/

#Favourite routes

/\*\*

- POST /api/favourite/add
- @description Add a product to user's favourite list
- @param {Object} req.body - Item information
- @param {String} req.body.productId - Product ID (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- DELETE /api/favourite/:productId
- @description Remove a product from user's favourite list
- @param {String} req.params.productId - Product ID (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- GET /api/favourite/
- @description Get user's favourite list with all products
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- DELETE /api/favourite/clear
- @description Clear all products from user's favourite list
- @returns {Object} {success: Boolean, data: null, message: String}
- @middleware Authentication required
  \*/

#Inventory routes

/\*\*

- GET /api/seller/inventory/
- @description Get inventory list with pagination and summary
- @param {Object} req.query - Query parameters
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 10)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- GET /api/seller/inventory/low-stock
- @description Get products with low stock (below threshold)
- @param {Object} req.query - Query parameters
- @param {Number} req.query.threshold - Stock threshold (default: 10)
- @returns {Object} {success: Boolean, data: Array, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- PUT /api/seller/inventory/stock/:productId
- @description Update product stock
- @param {String} req.params.productId - Product ID
- @param {Object} req.body - Stock update data
- @param {Number} req.body.totalStock - New total stock value (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

#Order routes

/\*\*

- POST /api/order/
- @description Create order from cart items
- @param {Object} req.body - Order data
- @param {Array} req.body.items - Cart items [{product, quantity}, ...]
- @param {Object} req.body.shippingAddress - Delivery address
- @returns {Object} {success: Boolean, data: {orderId}, message: String}
- @middleware Authentication required
  \*/

/\*\*

- POST /api/order/checkout
- @description Create checkout session for order
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- POST /api/order/payment/process
- @description Process payment after checkout
- @param {String} req.body.checkoutId - Checkout session ID
- @param {String} req.body.cardNumber - Card number
- @param {String} req.body.expiryDate - Card expiry date
- @param {String} req.body.cvv - CVV
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- POST /api/order/ship/:orderId
- @description Ship order (seller action)
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- GET /api/order/tracking/:trackingNumber
- @description Get shipment tracking status
- @param {String} req.params.trackingNumber - TCS tracking number
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- GET /api/order/invoice/:orderId
- @description Generate invoice for order
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- GET /api/order/invoice/html/:orderId
- @description Download invoice as HTML
- @param {String} req.params.orderId - Order ID
- @returns {HTML} Invoice HTML document
  \*/

/\*\*

- GET /api/order/seller/:sellerId/revenue
- @description Get seller revenue summary
- @param {String} req.params.sellerId - Seller ID (Shop \_id)
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

/\*\*

- GET /api/order/seller/:sellerId/sales
- @description Get seller sales and order details
- @param {String} req.params.sellerId - Seller ID
- @returns {Object} {success: Boolean, data: Array, message: String}
  \*/

#Product routes

/\*\*

- POST /api/seller/products/
- @description Add a new product (seller only)
- @param {Object} req.body - Product information
- @param {String} req.body.name - Product name (required)
- @param {String} req.body.description - Product description (required)
- @param {Number} req.body.price - Product price (required)
- @param {String} req.body.category - Product category (required)
- @param {Number} req.body.totalStock - Total stock (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- GET /api/seller/products/
- @description Get all products for seller with pagination and filters
- @param {Object} req.query - Query parameters
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 10)
- @param {String} req.query.search - Search by product name
- @param {String} req.query.category - Filter by category
- @param {String} req.query.status - Filter by status (active, inactive, discontinued)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- GET /api/seller/products/:productId
- @description Get product details
- @param {String} req.params.productId - Product ID
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- PUT /api/seller/products/:productId
- @description Update product information
- @param {String} req.params.productId - Product ID
- @param {Object} req.body - Update data (all optional)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- DELETE /api/seller/products/:productId
- @description Delete a product
- @param {String} req.params.productId - Product ID
- @returns {Object} {success: Boolean, data: null, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- PUT /api/seller/products/:productId/status
- @description Toggle product status (active, inactive, discontinued)
- @param {String} req.params.productId - Product ID
- @param {Object} req.body - Status data
- @param {String} req.body.status - Status (active, inactive, discontinued)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

#Public product routes

/\*\*

- GET /api/product/
- @description Get all products (public - no authentication required)
- @param {Object} req.query - Query parameters
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 20)
- @param {String} req.query.search - Search by product name
- @param {String} req.query.category - Filter by category
- @returns {Object} {success: Boolean, data: Array, message: String}
  \*/

/\*\*

- GET /api/product/:productId
- @description Get product details by ID (public)
- @param {String} req.params.productId - Product ID
- @returns {Object} {success: Boolean, data: Object, message: String}
  \*/

#review routes

/\*\*

- POST /api/reviews/
- @description Add a review for a product (verified purchase only)
- @param {Object} req.body - Review information
- @param {String} req.body.productId - Product ID (required)
- @param {String} req.body.orderId - Order ID for verified purchase (required)
- @param {Number} req.body.rating - Rating 1-5 (required)
- @param {String} req.body.title - Review title (required, 3-100 chars)
- @param {String} req.body.comment - Review comment (required, 10-1000 chars)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: user
  \*/

/\*\*

- GET /api/reviews/:productId
- @description Get all reviews for a product (public listing)
- @param {String} req.params.productId - Product ID
- @param {Object} req.query - Query parameters
- @param {String} req.query.sort - Sort order (newest, oldest, rating-high, rating-low) (default: newest)
- @returns {Object} {success: Boolean, data: Array, message: String}
- @middleware None (public endpoint)
  \*/

/\*\*

- GET /api/reviews/seller/:productId
- @description Get reviews for seller's product
- @param {String} req.params.productId - Product ID
- @returns {Object} {success: Boolean, data: Array, message: String}
- @middleware Authentication required, Role: seller
  \*/

#Seller routes

/\*\*

- POST /api/seller/shop
- @description Create a new shop for a seller
- @param {Object} req.body - Shop information
- @param {String} req.body.shopname - Shop name (required)
- @param {String} req.body.description - Shop description (required)
- @param {String} req.body.email - Shop contact email (required)
- @param {String} req.body.phonenumber - Shop contact phone (required)
- @param {Object} req.body.shopaddress - Shop business address (required)
- @param {Object} req.body.buyingaddress - Seller's buying/billing address (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @description Shop will be created with isverified status as 'pending'
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- GET /api/seller/shop
- @description Get shop details for the authenticated seller
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- PUT /api/seller/shop
- @description Update shop information
- @param {Object} req.body - Shop fields to update (all optional)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

#Seller order routes

/\*\*

- GET /api/seller/orders/
- @description Get seller's orders with pagination and filters
- @param {Object} req.query - Query parameters
- @param {Number} req.query.page - Page number (default: 1)
- @param {Number} req.query.limit - Items per page (default: 10)
- @param {String} req.query.status - Filter by order status (pending, accepted, rejected, shipped, delivered)
- @param {String} req.query.sellerStatus - Filter by seller status (pending, accepted, rejected, completed)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- POST /api/seller/orders/:orderId/accept
- @description Accept an order by seller
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- POST /api/seller/orders/:orderId/reject
- @description Reject an order by seller
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- POST /api/seller/orders/:orderId/complete
- @description Mark order as completed by seller
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required, Role: seller
  \*/

/\*\*

- DELETE /api/seller/orders/:orderId
- @description Delete a completed order
- @param {String} req.params.orderId - Order ID
- @returns {Object} {success: Boolean, data: null, message: String}
- @middleware Authentication required, Role: seller
  \*/

#User routes

/\*\*

- POST /api/user/profile/complete
- @description Complete user profile with basic information
- @param {Object} req.body - Profile information
- @param {String} req.body.firstname - First name (required)
- @param {String} req.body.lastname - Last name (required)
- @param {String} req.body.phonenumber - Phone number (required)
- @param {Date} req.body.dob - Date of birth (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- GET /api/user/profile
- @description Get complete user profile
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- POST /api/user/address
- @description Add a new address to user profile
- @param {Object} req.body - Address information
- @param {String} req.body.street - Street address (required)
- @param {String} req.body.city - City (required)
- @param {String} req.body.postalcode - Postal code (required)
- @param {String} req.body.country - Country (required)
- @param {Boolean} req.body.isdefault - Set as default address (optional)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- PUT /api/user/address/:addressId
- @description Update an existing address
- @param {String} req.params.addressId - Address ID (required)
- @param {Object} req.body - Address fields to update (all optional)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/

/\*\*

- DELETE /api/user/address/:addressId
- @description Delete an address from user profile
- @param {String} req.params.addressId - Address ID (required)
- @returns {Object} {success: Boolean, data: Object, message: String}
- @middleware Authentication required
  \*/
