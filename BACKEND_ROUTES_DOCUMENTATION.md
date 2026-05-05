# Backend Routes Documentation

This document provides a comprehensive guide to all API routes in the backend, including endpoints, request parameters, response formats, and behavior for different request scenarios.

---

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [User Routes](#user-routes)
3. [Product Routes](#product-routes)
4. [Public Product Routes](#public-product-routes)
5. [Order Routes](#order-routes)
6. [Seller Routes](#seller-routes)
7. [Seller Order Routes](#seller-order-routes)
8. [Inventory Routes](#inventory-routes)
9. [Favourite Routes](#favourite-routes)
10. [Review Routes](#review-routes)
11. [Admin Routes](#admin-routes)
12. [Admin Management Routes](#admin-management-routes)
13. [Analytics Routes](#analytics-routes)

---

## Authentication Routes

**Base URL:** `/auth`

### 1. User Registration

- **Endpoint:** `POST /auth/register`
- **Description:** Register a new user account
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "username": "string (3-30 chars)",
    "email": "string (valid email format)",
    "password": "string (min 6 chars, must include uppercase, lowercase, number)"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "string",
      "email": "string",
      "username": "string"
    },
    "message": "Registration successful"
  }
  ```
- **Error Response (400):**
  - Invalid email format
  - Username already exists
  - Weak password
  - Missing required fields
  ```json
  {
    "success": false,
    "message": "Validation error message"
  }
  ```

### 2. User Login

- **Endpoint:** `POST /auth/login`
- **Description:** Login user with credentials
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "string (valid email)",
    "password": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "string",
      "email": "string",
      "token": "JWT token string"
    },
    "message": "Login successful"
  }
  ```
- **Error Responses:**
  - **401 (Invalid credentials):**
    ```json
    {
      "success": false,
      "message": "Invalid email or password"
    }
    ```
  - **400 (Validation error):**
    ```json
    {
      "success": false,
      "message": "Email and password required"
    }
    ```

### 3. User Logout

- **Endpoint:** `POST /auth/logout`
- **Description:** Logout user and invalidate token
- **Authentication:** Not required
- **Request Body:** Empty
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Logout successful"
  }
  ```

### 4. Set User Role

- **Endpoint:** `POST /auth/set-role`
- **Description:** Set user role after registration (user or seller)
- **Authentication:** Required (JWT token)
- **Request Body:**
  ```json
  {
    "role": "user | seller"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "string",
      "role": "user | seller"
    },
    "message": "Role set successfully"
  }
  ```
- **Error Responses:**
  - **400 (Invalid role):**
    ```json
    {
      "success": false,
      "message": "Invalid role. Must be 'user' or 'seller'"
    }
    ```
  - **401 (Unauthorized):**
    ```json
    {
      "success": false,
      "message": "Authentication required"
    }
    ```

### 5. Admin Login

- **Endpoint:** `POST /auth/admin-login`
- **Description:** Login with admin credentials
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "string (valid email)",
    "password": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "adminId": "string",
      "email": "string",
      "role": "admin",
      "token": "JWT token string"
    },
    "message": "Admin login successful"
  }
  ```
- **Error Response (401):**
  - Invalid credentials or non-admin user attempting login
  ```json
  {
    "success": false,
    "message": "Invalid credentials or not an admin"
  }
  ```

---

## User Routes

**Base URL:** `/user`
**Authentication:** Required for all endpoints

### 1. Complete User Profile

- **Endpoint:** `POST /user/profile/complete`
- **Description:** Complete user's basic profile information
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "firstname": "string",
    "lastname": "string",
    "phonenumber": "string",
    "dob": "date (YYYY-MM-DD)"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "string",
      "firstname": "string",
      "lastname": "string",
      "phonenumber": "string",
      "dob": "date"
    },
    "message": "Profile completed successfully"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "message": "Missing or invalid required fields"
  }
  ```

### 2. Get User Profile

- **Endpoint:** `GET /user/profile`
- **Description:** Retrieve complete user profile with all details
- **Authentication:** Required
- **Query Parameters:** None
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "string",
      "username": "string",
      "email": "string",
      "firstname": "string",
      "lastname": "string",
      "phonenumber": "string",
      "dob": "date",
      "addresses": [
        {
          "addressId": "string",
          "street": "string",
          "city": "string",
          "postalcode": "string",
          "country": "string",
          "isdefault": "boolean"
        }
      ],
      "role": "user | seller"
    },
    "message": "Profile retrieved successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

### 3. Add Address

- **Endpoint:** `POST /user/address`
- **Description:** Add a new address to user profile
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "street": "string",
    "city": "string",
    "postalcode": "string",
    "country": "string",
    "isdefault": "boolean (optional)"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "addressId": "string",
      "street": "string",
      "city": "string",
      "postalcode": "string",
      "country": "string",
      "isdefault": "boolean"
    },
    "message": "Address added successfully"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "message": "Missing or invalid required fields"
  }
  ```

### 4. Update Address

- **Endpoint:** `PUT /user/address/:addressId`
- **Description:** Update an existing address
- **Authentication:** Required
- **URL Parameters:**
  - `addressId` (string): Address ID to update
- **Request Body:** (all fields optional)
  ```json
  {
    "street": "string",
    "city": "string",
    "postalcode": "string",
    "country": "string",
    "isdefault": "boolean"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "addressId": "string",
      "street": "string",
      "city": "string",
      "postalcode": "string",
      "country": "string",
      "isdefault": "boolean"
    },
    "message": "Address updated successfully"
  }
  ```
- **Error Responses:**
  - **404 (Address not found):**
    ```json
    {
      "success": false,
      "message": "Address not found"
    }
    ```
  - **400 (Invalid data):**
    ```json
    {
      "success": false,
      "message": "Invalid address data"
    }
    ```

### 5. Delete Address

- **Endpoint:** `DELETE /user/address/:addressId`
- **Description:** Delete an address from user profile
- **Authentication:** Required
- **URL Parameters:**
  - `addressId` (string): Address ID to delete
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Address deleted successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Address not found"
  }
  ```

---

## Product Routes

**Base URL:** `/api/seller/products`
**Authentication:** Required for all endpoints (Role: seller)

### 1. Add Product

- **Endpoint:** `POST /api/seller/products/`
- **Description:** Add a new product to seller's inventory
- **Authentication:** Required (Role: seller)
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "totalStock": "number"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "productId": "string",
      "name": "string",
      "price": "number",
      "totalStock": "number",
      "status": "active",
      "seller": "string"
    },
    "message": "Product added successfully"
  }
  ```
- **Error Responses:**
  - **400 (Validation error):**
    ```json
    {
      "success": false,
      "message": "All fields required: name, description, price, category, totalStock"
    }
    ```
  - **401 (Not seller):**
    ```json
    {
      "success": false,
      "message": "Only sellers can add products"
    }
    ```

### 2. Get Seller Products

- **Endpoint:** `GET /api/seller/products/`
- **Description:** Get all products for authenticated seller with pagination
- **Authentication:** Required (Role: seller)
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `search` (string, optional): Search by product name
  - `category` (string, optional): Filter by category
  - `status` (string, optional): Filter by status (active, inactive, discontinued)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "productId": "string",
        "name": "string",
        "description": "string",
        "price": "number",
        "category": "string",
        "totalStock": "number",
        "status": "active | inactive | discontinued",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Products retrieved successfully"
  }
  ```

### 3. Get Product Details

- **Endpoint:** `GET /api/seller/products/:productId`
- **Description:** Get details of a specific product
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `productId` (string): Product ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "productId": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "totalStock": "number",
      "status": "string",
      "rating": "number",
      "reviews": []
    },
    "message": "Product retrieved successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Product not found"
  }
  ```

### 4. Update Product

- **Endpoint:** `PUT /api/seller/products/:productId`
- **Description:** Update product information
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `productId` (string): Product ID to update
- **Request Body:** (all fields optional)
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "totalStock": "number"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "productId": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "totalStock": "number"
    },
    "message": "Product updated successfully"
  }
  ```
- **Error Responses:**
  - **404 (Not found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }
    ```
  - **403 (Unauthorized):**
    ```json
    {
      "success": false,
      "message": "You can only update your own products"
    }
    ```

### 5. Delete Product

- **Endpoint:** `DELETE /api/seller/products/:productId`
- **Description:** Delete a product from seller's inventory
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `productId` (string): Product ID to delete
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Product deleted successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Product not found"
  }
  ```

### 6. Toggle Product Status

- **Endpoint:** `PUT /api/seller/products/:productId/status`
- **Description:** Change product status (active, inactive, discontinued)
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `productId` (string): Product ID
- **Request Body:**
  ```json
  {
    "status": "active | inactive | discontinued"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "productId": "string",
      "name": "string",
      "status": "active | inactive | discontinued"
    },
    "message": "Product status updated successfully"
  }
  ```
- **Error Responses:**
  - **400 (Invalid status):**
    ```json
    {
      "success": false,
      "message": "Invalid status. Must be: active, inactive, or discontinued"
    }
    ```
  - **404 (Not found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }
    ```

---

## Public Product Routes

**Base URL:** `/api/product`
**Authentication:** Not required for all endpoints

### 1. Get All Products

- **Endpoint:** `GET /api/product/`
- **Description:** Get all active products with pagination (public listing)
- **Authentication:** Not required
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 20)
  - `search` (string, optional): Search by product name
  - `category` (string, optional): Filter by category
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "productId": "string",
        "name": "string",
        "description": "string",
        "price": "number",
        "category": "string",
        "totalStock": "number",
        "seller": {
          "sellerId": "string",
          "shopname": "string"
        },
        "rating": "number",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Products retrieved successfully"
  }
  ```
- **Behavior:**
  - Only returns products with status "active"
  - Results are sorted by creation date (newest first)
  - Results are paginated

### 2. Get Product Details

- **Endpoint:** `GET /api/product/:productId`
- **Description:** Get detailed information about a product (public)
- **Authentication:** Not required
- **URL Parameters:**
  - `productId` (string): Product ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "productId": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "totalStock": "number",
      "seller": {
        "sellerId": "string",
        "shopname": "string",
        "shopaddress": "string",
        "contact": "string",
        "rating": "number"
      },
      "reviews": [
        {
          "reviewId": "string",
          "rating": "number",
          "title": "string",
          "comment": "string",
          "user": {
            "firstname": "string",
            "lastname": "string"
          }
        }
      ],
      "rating": "number"
    },
    "message": "Product retrieved successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "data": null,
    "message": "Product not found"
  }
  ```

---

## Order Routes

**Base URL:** `/order`
**Authentication:** Required for all endpoints

### 1. Create Order

- **Endpoint:** `POST /api/order/`
- **Description:** Create a new order from cart items
- **Authentication:** Required (Role: user)
- **Request Body:**
  ```json
  {
    "items": [
      {
        "product": "string (product ID)",
        "quantity": "number"
      }
    ],
    "shippingAddress": {
      "street": "string",
      "city": "string",
      "postalcode": "string",
      "country": "string"
    }
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "string",
      "totalPrice": "number"
    },
    "message": "Order created. Proceed to payment."
  }
  ```
- **Error Responses:**
  - **400 (Empty cart):**
    ```json
    {
      "success": false,
      "message": "Cart is empty"
    }
    ```
  - **400 (Missing address):**
    ```json
    {
      "success": false,
      "message": "Shipping address required"
    }
    ```
  - **404 (Product not found):**
    ```json
    {
      "success": false,
      "message": "Product {productId} not found"
    }
    ```
- **Side Effects:**
  - Socket notification sent to seller about new order
  - Order status: "pending"
  - Payment status: "pending"

### 2. Create Checkout Session

- **Endpoint:** `POST /api/order/:orderId/checkout`
- **Description:** Create checkout session for order payment
- **Authentication:** Required
- **URL Parameters:**
  - `orderId` (string): Order ID
- **Request Body:**
  ```json
  {
    "paymentMethod": "card | wallet | other"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "checkoutId": "string",
      "orderId": "string",
      "totalAmount": "number",
      "paymentMethod": "string"
    },
    "message": "Checkout session created"
  }
  ```
- **Error Responses:**
  - **404 (Order not found):**
    ```json
    {
      "success": false,
      "message": "Order not found"
    }
    ```
  - **404 (Order not accepted):**
    ```json
    {
      "success": false,
      "message": "Order not accepted"
    }
    ```

### 3. Process Payment

- **Endpoint:** `POST /api/order/payment/process`
- **Description:** Process payment for checkout session
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "checkoutId": "string",
    "cardNumber": "string",
    "expiryDate": "string (MM/YY)",
    "cvv": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "paymentId": "string",
      "orderId": "string",
      "status": "completed",
      "amount": "number"
    },
    "message": "Payment processed successfully"
  }
  ```
- **Error Responses:**
  - **400 (Missing fields):**
    ```json
    {
      "success": false,
      "message": "Missing required payment information"
    }
    ```
  - **400 (Payment failed):**
    ```json
    {
      "success": false,
      "message": "Payment processing failed"
    }
    ```

### 4. Ship Order

- **Endpoint:** `POST /api/order/ship/:orderId`
- **Description:** Create shipment for order (seller action)
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `orderId` (string): Order ID
- **Request Body:**
  ```json
  {
    "origin": "string (optional, default: Warehouse)",
    "destination": "string (optional, default: order address)",
    "weight": "number (optional, default: 1)"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "shipmentId": "string",
      "orderId": "string",
      "trackingNumber": "string",
      "estimatedDelivery": "date",
      "status": "shipped"
    },
    "message": "Shipment created successfully"
  }
  ```
- **Error Responses:**
  - **404 (Order not found):**
    ```json
    {
      "success": false,
      "message": "Order not found"
    }
    ```
  - **400 (Payment not completed):**
    ```json
    {
      "success": false,
      "message": "Order payment must be completed before shipping"
    }
    ```
- **Side Effects:**
  - Automatic delivery update scheduled based on estimated delivery time
  - Order status updated to "shipped"

### 5. Get Tracking Status

- **Endpoint:** `GET /api/order/tracking/:trackingNumber`
- **Description:** Get shipment tracking information
- **Authentication:** Required
- **URL Parameters:**
  - `trackingNumber` (string): TCS tracking number
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "trackingNumber": "string",
      "status": "in-transit | delivered | pending",
      "location": "string",
      "estimatedDelivery": "date",
      "updates": [
        {
          "timestamp": "date",
          "status": "string",
          "location": "string"
        }
      ]
    },
    "message": "Tracking information retrieved"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Tracking not found"
  }
  ```

### 6. Generate Invoice

- **Endpoint:** `GET /api/order/invoice/:orderId`
- **Description:** Generate invoice for order
- **Authentication:** Required
- **URL Parameters:**
  - `orderId` (string): Order ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "invoiceId": "string",
      "orderId": "string",
      "invoiceNumber": "string",
      "issueDate": "date",
      "dueDate": "date",
      "items": [
        {
          "productName": "string",
          "quantity": "number",
          "unitPrice": "number",
          "total": "number"
        }
      ],
      "subtotal": "number",
      "tax": "number",
      "total": "number",
      "seller": {
        "shopname": "string",
        "contact": "string"
      }
    },
    "message": "Invoice generated successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Order not found"
  }
  ```

---

## Seller Routes

**Base URL:** `/seller`
**Authentication:** Required (Role: seller)

### 1. Create Shop

- **Endpoint:** `POST /api/seller/shop`
- **Description:** Create a new shop for seller
- **Authentication:** Required (Role: seller)
- **Request Body:**
  ```json
  {
    "shopname": "string",
    "description": "string",
    "email": "string",
    "phonenumber": "string",
    "shopaddress": {
      "street": "string",
      "city": "string",
      "postalcode": "string",
      "country": "string"
    },
    "buyingaddress": {
      "street": "string",
      "city": "string",
      "postalcode": "string",
      "country": "string"
    }
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "shopId": "string",
      "shopname": "string",
      "isverified": "pending"
    },
    "message": "Shop created successfully. Awaiting admin verification"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "message": "All required fields must be provided"
  }
  ```
- **Behavior:**
  - Initial verification status: "pending"
  - Admin approval required before shop becomes active

### 2. Get Shop Details

- **Endpoint:** `GET /api/seller/shop`
- **Description:** Get shop details for authenticated seller
- **Authentication:** Required (Role: seller)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "shopId": "string",
      "shopname": "string",
      "description": "string",
      "email": "string",
      "phonenumber": "string",
      "shopaddress": "object",
      "buyingaddress": "object",
      "isverified": "pending | verified | rejected",
      "rating": "number",
      "totalProducts": "number",
      "createdAt": "date"
    },
    "message": "Shop details retrieved successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Shop not found"
  }
  ```

### 3. Update Shop

- **Endpoint:** `PUT /api/seller/shop`
- **Description:** Update shop information
- **Authentication:** Required (Role: seller)
- **Request Body:** (all fields optional)
  ```json
  {
    "shopname": "string",
    "description": "string",
    "email": "string",
    "phonenumber": "string",
    "shopaddress": "object",
    "buyingaddress": "object"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "shopId": "string",
      "shopname": "string",
      "description": "string",
      "email": "string",
      "phonenumber": "string"
    },
    "message": "Shop updated successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Shop not found"
  }
  ```

---

## Seller Order Routes

**Base URL:** `/api/seller/orders`
**Authentication:** Required (Role: seller)

### 1. Get Seller Orders

- **Endpoint:** `GET /api/seller/orders/`
- **Description:** Get seller's orders with pagination and filters
- **Authentication:** Required (Role: seller)
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `status` (string, optional): Filter by order status (pending, accepted, rejected, shipped, delivered)
  - `sellerStatus` (string, optional): Filter by seller status (pending, accepted, rejected, completed)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "orderId": "string",
        "userId": "string",
        "items": "array",
        "totalPrice": "number",
        "status": "pending | accepted | rejected | shipped | delivered",
        "sellerStatus": "pending | accepted | rejected | completed",
        "paymentStatus": "pending | paid",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Orders retrieved successfully"
  }
  ```

### 2. Accept Order

- **Endpoint:** `POST /api/seller/orders/:orderId/accept`
- **Description:** Accept order from customer
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `orderId` (string): Order ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "string",
      "status": "accepted",
      "sellerStatus": "accepted"
    },
    "message": "Order accepted successfully"
  }
  ```
- **Error Responses:**
  - **404 (Not found):**
    ```json
    {
      "success": false,
      "message": "Order not found"
    }
    ```
  - **400 (Already accepted/rejected):**
    ```json
    {
      "success": false,
      "message": "Order status cannot be changed"
    }
    ```

### 3. Reject Order

- **Endpoint:** `POST /api/seller/orders/:orderId/reject`
- **Description:** Reject order with reason
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `orderId` (string): Order ID
- **Request Body:**
  ```json
  {
    "rejectionReason": "string (optional)"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "string",
      "status": "rejected",
      "sellerStatus": "rejected",
      "rejectionReason": "string"
    },
    "message": "Order rejected successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Order not found"
  }
  ```

### 4. Complete Order

- **Endpoint:** `POST /api/seller/orders/:orderId/complete`
- **Description:** Mark order as completed
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `orderId` (string): Order ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "string",
      "status": "delivered",
      "sellerStatus": "completed"
    },
    "message": "Order marked as completed"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Order not found"
  }
  ```

### 5. Delete Order

- **Endpoint:** `DELETE /api/seller/orders/:orderId`
- **Description:** Delete a completed order
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `orderId` (string): Order ID to delete
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Order deleted successfully"
  }
  ```
- **Error Responses:**
  - **404 (Not found):**
    ```json
    {
      "success": false,
      "message": "Order not found"
    }
    ```
  - **400 (Cannot delete):**
    ```json
    {
      "success": false,
      "message": "Only completed orders can be deleted"
    }
    ```

---

## Inventory Routes

**Base URL:** `/api/seller/inventory`
**Authentication:** Required (Role: seller)

### 1. Get Inventory

- **Endpoint:** `GET /api/seller/inventory/`
- **Description:** Get seller's inventory with pagination and summary
- **Authentication:** Required (Role: seller)
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalProducts": "number",
        "totalStock": "number",
        "lowStockCount": "number"
      },
      "products": [
        {
          "productId": "string",
          "name": "string",
          "category": "string",
          "totalStock": "number",
          "price": "number",
          "status": "active | inactive | discontinued"
        }
      ]
    },
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Inventory retrieved successfully"
  }
  ```

### 2. Get Low Stock Products

- **Endpoint:** `GET /api/seller/inventory/low-stock`
- **Description:** Get products with stock below threshold
- **Authentication:** Required (Role: seller)
- **Query Parameters:**
  - `threshold` (number, optional, default: 10): Stock threshold
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "productId": "string",
        "name": "string",
        "currentStock": "number",
        "threshold": "number",
        "status": "critical | warning"
      }
    ],
    "message": "Low stock products retrieved"
  }
  ```

### 3. Update Product Stock

- **Endpoint:** `PUT /api/seller/inventory/stock/:productId`
- **Description:** Update product stock quantity
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `productId` (string): Product ID
- **Request Body:**
  ```json
  {
    "totalStock": "number"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "productId": "string",
      "name": "string",
      "previousStock": "number",
      "newStock": "number"
    },
    "message": "Stock updated successfully"
  }
  ```
- **Error Responses:**
  - **404 (Product not found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }
    ```
  - **400 (Invalid stock):**
    ```json
    {
      "success": false,
      "message": "Stock must be a positive number"
    }
    ```

---

## Favourite Routes

**Base URL:** `/favourite`
**Authentication:** Required for all endpoints

### 1. Add to Favourite

- **Endpoint:** `POST /favourite/add`
- **Description:** Add a product to user's favourite list
- **Authentication:** Required (Role: user)
- **Request Body:**
  ```json
  {
    "productId": "string"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "favouriteId": "string",
      "productId": "string",
      "productName": "string",
      "addedAt": "date"
    },
    "message": "Added to favourites"
  }
  ```
- **Error Responses:**
  - **404 (Product not found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }
    ```
  - **400 (Already in favourites):**
    ```json
    {
      "success": false,
      "message": "Product already in favourites"
    }
    ```

### 2. Remove from Favourite

- **Endpoint:** `DELETE /favourite/:productId`
- **Description:** Remove product from user's favourite list
- **Authentication:** Required (Role: user)
- **URL Parameters:**
  - `productId` (string): Product ID to remove
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Removed from favourites"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Product not in favourites"
  }
  ```

### 3. Get Favourites

- **Endpoint:** `GET /favourite/`
- **Description:** Get user's complete favourite list
- **Authentication:** Required (Role: user)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "totalCount": "number",
      "products": [
        {
          "productId": "string",
          "name": "string",
          "description": "string",
          "price": "number",
          "category": "string",
          "seller": {
            "shopname": "string"
          },
          "rating": "number",
          "addedAt": "date"
        }
      ]
    },
    "message": "Favourites retrieved successfully"
  }
  ```

### 4. Clear Favourites

- **Endpoint:** `DELETE /favourite/clear`
- **Description:** Clear all products from favourite list
- **Authentication:** Required (Role: user)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Favourites cleared successfully"
  }
  ```

---

## Review Routes

**Base URL:** `/api/reviews`

### 1. Add Review

- **Endpoint:** `POST /api/reviews/`
- **Description:** Add a review for a product (verified purchase only)
- **Authentication:** Required (Role: user)
- **Request Body:**
  ```json
  {
    "productId": "string",
    "orderId": "string",
    "rating": "number (1-5)",
    "title": "string (3-100 chars)",
    "comment": "string (10-1000 chars)"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "reviewId": "string",
      "productId": "string",
      "rating": "number",
      "title": "string",
      "comment": "string",
      "createdAt": "date"
    },
    "message": "Review added successfully"
  }
  ```
- **Error Responses:**
  - **400 (Invalid rating):**
    ```json
    {
      "success": false,
      "message": "Rating must be between 1 and 5"
    }
    ```
  - **400 (Not verified purchase):**
    ```json
    {
      "success": false,
      "message": "Can only review products from purchased orders"
    }
    ```
  - **400 (Already reviewed):**
    ```json
    {
      "success": false,
      "message": "You have already reviewed this product"
    }
    ```

### 2. Get Product Reviews

- **Endpoint:** `GET /api/reviews/:productId`
- **Description:** Get all reviews for a product (public)
- **Authentication:** Not required
- **URL Parameters:**
  - `productId` (string): Product ID
- **Query Parameters:**
  - `sort` (string, optional): Sort order (newest, oldest, rating-high, rating-low) (default: newest)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "reviewId": "string",
        "rating": "number",
        "title": "string",
        "comment": "string",
        "user": {
          "firstname": "string",
          "lastname": "string"
        },
        "createdAt": "date"
      }
    ],
    "message": "Reviews retrieved successfully"
  }
  ```
- **Behavior:**
  - Reviews sorted based on "sort" parameter
  - Only shows reviews from verified purchases

### 3. Get Seller's Product Reviews

- **Endpoint:** `GET /api/reviews/seller/:productId`
- **Description:** Get reviews for seller's product
- **Authentication:** Required (Role: seller)
- **URL Parameters:**
  - `productId` (string): Product ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "reviewId": "string",
        "rating": "number",
        "title": "string",
        "comment": "string",
        "user": {
          "firstname": "string",
          "lastname": "string"
        },
        "createdAt": "date"
      }
    ],
    "message": "Product reviews retrieved successfully"
  }
  ```

---

## Admin Routes

**Base URL:** `/admin`
**Authentication:** Required (Role: admin)

### 1. Get Pending Shops

- **Endpoint:** `GET /admin/shops/pending`
- **Description:** Get all pending shop verifications
- **Authentication:** Required (Role: admin)
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `search` (string, optional): Search by shop name
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "shopId": "string",
        "shopname": "string",
        "sellerName": "string",
        "email": "string",
        "phonenumber": "string",
        "description": "string",
        "shopaddress": "object",
        "isverified": "pending",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Pending shops retrieved"
  }
  ```

### 2. Get All Shops

- **Endpoint:** `GET /admin/shops`
- **Description:** Get all shops with filtering and pagination
- **Authentication:** Required (Role: admin)
- **Query Parameters:**
  - `status` (string, optional): Filter by status (pending, verified, rejected)
  - `search` (string, optional): Search by shop name
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "shopId": "string",
        "shopname": "string",
        "sellerName": "string",
        "email": "string",
        "status": "pending | verified | rejected",
        "rating": "number",
        "totalProducts": "number",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Shops retrieved successfully"
  }
  ```

### 3. Verify Shop

- **Endpoint:** `POST /admin/shops/:shopId/verify`
- **Description:** Verify a shop and set status to 'verified'
- **Authentication:** Required (Role: admin)
- **URL Parameters:**
  - `shopId` (string): Shop ID to verify
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "shopId": "string",
      "shopname": "string",
      "status": "verified"
    },
    "message": "Shop verified successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Shop not found"
  }
  ```

### 4. Reject Shop

- **Endpoint:** `POST /admin/shops/:shopId/reject`
- **Description:** Reject a shop with a reason
- **Authentication:** Required (Role: admin)
- **URL Parameters:**
  - `shopId` (string): Shop ID to reject
- **Request Body:**
  ```json
  {
    "rejectionreason": "string (required)"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "shopId": "string",
      "shopname": "string",
      "status": "rejected",
      "rejectionreason": "string"
    },
    "message": "Shop rejected successfully"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "message": "Rejection reason required"
  }
  ```

### 5. Bulk Verify Shops

- **Endpoint:** `POST /admin/shops/bulk-verify`
- **Description:** Verify multiple shops at once
- **Authentication:** Required (Role: admin)
- **Request Body:**
  ```json
  {
    "shopIds": ["string", "string", ...]
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "verified": "number",
      "failed": "number",
      "results": [
        {
          "shopId": "string",
          "status": "success | failed",
          "message": "string"
        }
      ]
    },
    "message": "Bulk verification completed"
  }
  ```

### 6. Delete Shop

- **Endpoint:** `DELETE /admin/shops/:shopId`
- **Description:** Delete a shop (admin only)
- **Authentication:** Required (Role: admin)
- **URL Parameters:**
  - `shopId` (string): Shop ID to delete
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Shop deleted successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Shop not found"
  }
  ```

---

## Admin Management Routes

**Base URL:** `/api/admin/management`
**Authentication:** Required (Role: admin)

### 1. Add New Admin

- **Endpoint:** `POST /api/admin/management/add-admin`
- **Description:** Add a new admin user (only existing admins can do this)
- **Authentication:** Required (Role: admin)
- **Request Body:**
  ```json
  {
    "username": "string (3-30 chars)",
    "email": "string (valid email)",
    "password": "string (6+ chars, uppercase, lowercase, number)"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "adminId": "string",
      "username": "string",
      "email": "string",
      "role": "admin"
    },
    "message": "Admin user created successfully"
  }
  ```
- **Error Responses:**
  - **400 (Email exists):**
    ```json
    {
      "success": false,
      "message": "Email already registered"
    }
    ```
  - **400 (Weak password):**
    ```json
    {
      "success": false,
      "message": "Password must be at least 6 characters with uppercase, lowercase, and number"
    }
    ```

### 2. Get All Admins

- **Endpoint:** `GET /api/admin/management/all-admins`
- **Description:** Get all admin users with pagination
- **Authentication:** Required (Role: admin)
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "adminId": "string",
        "username": "string",
        "email": "string",
        "role": "admin",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    },
    "message": "Admins retrieved successfully"
  }
  ```

### 3. Remove Admin

- **Endpoint:** `DELETE /api/admin/management/remove-admin/:adminIdToRemove`
- **Description:** Remove admin privileges from a user
- **Authentication:** Required (Role: admin)
- **URL Parameters:**
  - `adminIdToRemove` (string): Admin ID to remove
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Admin privileges removed successfully"
  }
  ```
- **Error Responses:**
  - **404 (Admin not found):**
    ```json
    {
      "success": false,
      "message": "Admin not found"
    }
    ```
  - **400 (Cannot remove self):**
    ```json
    {
      "success": false,
      "message": "Cannot remove your own admin privileges"
    }
    ```
- **Side Effects:**
  - User is converted to 'user' role

---

## Analytics Routes

**Base URL:** `/api/seller/analytics`
**Authentication:** Required (Role: seller)

### 1. Get Analytics

- **Endpoint:** `GET /api/seller/analytics/`
- **Description:** Get seller analytics including revenue, sales, and inventory stats
- **Authentication:** Required (Role: seller)
- **Query Parameters:**
  - `period` (string, optional): Analytics period (week, month, year) (default: month)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "totalRevenue": "number",
      "totalSales": "number",
      "averageOrderValue": "number",
      "inventorySummary": {
        "totalProducts": "number",
        "activeProducts": "number",
        "totalStock": "number"
      },
      "lowStockAlerts": [
        {
          "productId": "string",
          "name": "string",
          "currentStock": "number",
          "threshold": "number"
        }
      ]
    },
    "message": "Analytics retrieved successfully"
  }
  ```

### 2. Get Revenue Trends

- **Endpoint:** `GET /api/seller/analytics/trends`
- **Description:** Get revenue and order trends over time
- **Authentication:** Required (Role: seller)
- **Query Parameters:**
  - `period` (string, optional): Aggregation period (day, week, month, year) (default: month)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "date",
        "revenue": "number",
        "orders": "number",
        "averageOrderValue": "number"
      }
    ],
    "message": "Trends retrieved successfully"
  }
  ```

---

## Response Status Codes Summary

| Code | Meaning               | Common Use                               |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Successful GET, PUT, POST operations     |
| 201  | Created               | Resource created successfully            |
| 400  | Bad Request           | Validation error, missing fields         |
| 401  | Unauthorized          | Authentication required or invalid token |
| 403  | Forbidden             | Insufficient permissions/role            |
| 404  | Not Found             | Resource doesn't exist                   |
| 500  | Internal Server Error | Server-side error                        |

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error (only in development mode)"
}
```

---

## Authentication & Authorization

- **Token Type:** JWT (JSON Web Token)
- **Header:** `Authorization: Bearer <token>`
- **Token Location:** Provided in login response
- **Token Storage:** Client-side (localStorage recommended)
- **Roles:** user, seller, admin
- **Role-based Access:** Each endpoint specifies required role in authentication section

---

## Socket Events

Real-time notifications are sent via WebSocket:

- **New Order:** Seller is notified when customer creates order
- **Order Status Change:** Customer notified when seller accepts/rejects order
- **Order Shipped:** Customer notified when order is shipped
- **Order Delivered:** Customer notified when order is delivered

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:

- Per-user rate limits
- Per-endpoint rate limits
- DDoS protection

---

## Version History

- **v1.0** - Initial API Documentation
- **Date:** May 5, 2026
