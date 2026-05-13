# Frontend Development Guide

## Project Overview

This is a full-stack e-commerce platform with support for users, sellers, admins, and products. The frontend is built with **Vite + React**.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Authentication Flow](#authentication-flow)
3. [API Routes Documentation](#api-routes-documentation)
4. [Pages Required](#pages-required)
5. [Components Required](#components-required)
6. [State Management](#state-management)
7. [Data Structures](#data-structures)

---

## Project Setup

### Environment Variables (`.env.local`)

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=E-Commerce Platform
```

### Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Common/
│   │   ├── User/
│   │   ├── Seller/
│   │   └── Admin/
│   ├── pages/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── seller/
│   │   └── admin/
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   └── seller.service.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useUser.js
│   │   └── useApi.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── UserContext.js
│   │   └── CartContext.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## Authentication Flow

### 1. Registration

**Route:** `POST /api/auth/register`

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "id": "userId123",
    "username": "john_doe",
    "email": "john@example.com",
    "role": null,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully"
}
```

**Validation:**

- Username: 3-30 characters
- Email: Valid format
- Password: Min 6 chars, uppercase, lowercase, number

### 2. Set Role (Required after register)

**Route:** `POST /api/auth/set-role`

**Request (Requires Auth Token):**

```json
{
  "role": "user" // or "seller"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "userId123",
    "role": "user",
    "token": "updatedToken..."
  },
  "message": "Role set successfully"
}
```

### 3. Login

**Route:** `POST /api/auth/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "id": "userId123",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

### 4. Admin Login

**Route:** `POST /api/auth/admin-login`

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "adminId123",
    "role": "admin",
    "token": "adminToken..."
  },
  "message": "Admin login successful"
}
```

### 5. Logout

**Route:** `POST /api/auth/logout`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

---

## API Routes Documentation

### USER ROUTES (`/api/user`)

#### 1. Complete Profile

**Route:** `POST /api/user/profile/complete`

**Request (Auth Required):**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "phonenumber": "+123456789",
  "dob": "1990-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "userId123",
    "firstname": "John",
    "lastname": "Doe",
    "phonenumber": "+123456789",
    "dob": "1990-01-15",
    "addresses": []
  },
  "message": "Profile completed successfully"
}
```

#### 2. Get Profile

**Route:** `GET /api/user/profile`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "userId123",
    "username": "john_doe",
    "email": "john@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "phonenumber": "+123456789",
    "dob": "1990-01-15",
    "addresses": [
      {
        "_id": "addr1",
        "street": "123 Main St",
        "city": "New York",
        "postalcode": "10001",
        "country": "USA",
        "isdefault": true
      }
    ]
  },
  "message": "Profile retrieved successfully"
}
```

#### 3. Add Address

**Route:** `POST /api/user/address`

**Request:**

```json
{
  "street": "123 Main St",
  "city": "New York",
  "postalcode": "10001",
  "country": "USA",
  "isdefault": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "addr1",
    "street": "123 Main St",
    "city": "New York",
    "postalcode": "10001",
    "country": "USA",
    "isdefault": false
  },
  "message": "Address added successfully"
}
```

#### 4. Update Address

**Route:** `PUT /api/user/address/:addressId`

**Request:**

```json
{
  "street": "456 New St",
  "city": "Boston",
  "postalcode": "02101"
}
```

**Response:** Same as Add Address

#### 5. Delete Address

**Route:** `DELETE /api/user/address/:addressId`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Address deleted successfully"
}
```

---

### PRODUCT ROUTES (Public)

#### 1. Get All Products (Public/No Auth)

**Route:** `GET /api/public-products`

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)
- `category` (string, optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "prod1",
      "name": "Laptop",
      "description": "High performance laptop",
      "price": 999.99,
      "category": "Electronics",
      "totalStock": 50,
      "seller": {
        "_id": "seller1",
        "shopname": "TechStore"
      },
      "rating": 4.5,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  },
  "message": "Products retrieved successfully"
}
```

#### 2. Get Product Details (Public)

**Route:** `GET /api/public-products/:productId`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "prod1",
    "name": "Laptop",
    "description": "High performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "totalStock": 50,
    "seller": {
      "_id": "seller1",
      "shopname": "TechStore",
      "shopaddress": "123 Tech St",
      "rating": 4.8
    },
    "reviews": [
      {
        "_id": "rev1",
        "rating": 5,
        "title": "Excellent product",
        "comment": "Great quality and fast shipping",
        "user": {
          "firstname": "John",
          "lastname": "Doe"
        },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "message": "Product retrieved successfully"
}
```

---

### SELLER ROUTES (`/api/seller` - Auth Required, Role: Seller)

#### 1. Create Shop

**Route:** `POST /api/seller/shop`

**Request:**

```json
{
  "shopname": "My Tech Store",
  "description": "Premium electronics seller",
  "email": "shop@example.com",
  "phonenumber": "+1234567890",
  "shopaddress": {
    "street": "123 Store St",
    "city": "New York",
    "postalcode": "10001",
    "country": "USA"
  },
  "buyingaddress": {
    "street": "456 Home St",
    "city": "New York",
    "postalcode": "10002",
    "country": "USA"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "shop1",
    "shopname": "My Tech Store",
    "description": "Premium electronics seller",
    "isverified": "pending",
    "totalRevenue": 0,
    "earnings": 0,
    "rating": 0
  },
  "message": "Shop created successfully. Awaiting verification."
}
```

#### 2. Get Shop Details

**Route:** `GET /api/seller/shop`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "shop1",
    "shopname": "My Tech Store",
    "description": "Premium electronics seller",
    "email": "shop@example.com",
    "phonenumber": "+1234567890",
    "isverified": "verified",
    "totalRevenue": 5000,
    "earnings": 4500,
    "rating": 4.7,
    "transactions": [
      {
        "type": "delivery_payment",
        "amount": 500,
        "date": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "message": "Shop retrieved successfully"
}
```

#### 3. Update Shop

**Route:** `PUT /api/seller/shop`

**Request:** (All fields optional)

```json
{
  "shopname": "Updated Shop Name",
  "description": "Updated description"
}
```

**Response:** Same as Get Shop Details

---

### PRODUCT MANAGEMENT ROUTES (`/api/product` - Auth Required, Role: Seller)

#### 1. Add Product

**Route:** `POST /api/product`

**Request:**

```json
{
  "name": "Wireless Mouse",
  "description": "Comfortable wireless mouse",
  "price": 29.99,
  "category": "Accessories",
  "totalStock": 100
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "prod1",
    "name": "Wireless Mouse",
    "description": "Comfortable wireless mouse",
    "price": 29.99,
    "category": "Accessories",
    "totalStock": 100,
    "seller": "seller1",
    "status": "active",
    "rating": 0,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Product added successfully"
}
```

#### 2. Get Seller Products

**Route:** `GET /api/product`

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional)
- `category` (optional)
- `status` (active | inactive | discontinued)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "prod1",
      "name": "Wireless Mouse",
      "price": 29.99,
      "category": "Accessories",
      "totalStock": 100,
      "status": "active",
      "rating": 4.2
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### 3. Get Product Details

**Route:** `GET /api/product/:productId`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "prod1",
    "name": "Wireless Mouse",
    "description": "Comfortable wireless mouse",
    "price": 29.99,
    "category": "Accessories",
    "totalStock": 100,
    "status": "active",
    "rating": 4.2,
    "reviews": 15
  }
}
```

#### 4. Update Product

**Route:** `PUT /api/product/:productId`

**Request:** (All fields optional)

```json
{
  "name": "Updated Mouse",
  "price": 34.99,
  "totalStock": 80
}
```

**Response:** Same as Add Product

#### 5. Delete Product

**Route:** `DELETE /api/product/:productId`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Product deleted successfully"
}
```

#### 6. Toggle Product Status

**Route:** `PUT /api/product/:productId/status`

**Request:**

```json
{
  "status": "inactive" // or "active" or "discontinued"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "prod1",
    "status": "inactive"
  },
  "message": "Product status updated"
}
```

---

### INVENTORY ROUTES (`/api/inventory` - Auth Required, Role: Seller)

#### 1. Get Inventory

**Route:** `GET /api/inventory`

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "prod1",
        "name": "Wireless Mouse",
        "totalStock": 100,
        "category": "Accessories"
      }
    ],
    "summary": {
      "totalProducts": 25,
      "totalStock": 2500,
      "lowStockCount": 3
    }
  },
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### 2. Get Low Stock Products

**Route:** `GET /api/inventory/low-stock`

**Query Parameters:**

- `threshold` (default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "prod1",
      "name": "Wireless Mouse",
      "totalStock": 5,
      "category": "Accessories"
    }
  ]
}
```

#### 3. Update Product Stock

**Route:** `PUT /api/inventory/stock/:productId`

**Request:**

```json
{
  "totalStock": 150
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "prod1",
    "name": "Wireless Mouse",
    "totalStock": 150
  },
  "message": "Stock updated successfully"
}
```

---

### FAVOURITE ROUTES (`/api/favourite` - Auth Required)

#### 1. Add to Favourite

**Route:** `POST /api/favourite/add`

**Request:**

```json
{
  "productId": "prod1"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "fav1",
    "user": "user1",
    "products": ["prod1"]
  },
  "message": "Added to favourites"
}
```

#### 2. Get Favourites

**Route:** `GET /api/favourite`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "fav1",
    "products": [
      {
        "_id": "prod1",
        "name": "Wireless Mouse",
        "price": 29.99,
        "category": "Accessories"
      }
    ]
  },
  "message": "Favourites retrieved successfully"
}
```

#### 3. Remove from Favourite

**Route:** `DELETE /api/favourite/:productId`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Removed from favourites"
}
```

#### 4. Clear All Favourites

**Route:** `DELETE /api/favourite/clear`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Favourites cleared"
}
```

---

### ORDER ROUTES (`/api/order` - Auth Required)

#### 1. Create Order

**Route:** `POST /api/order`

**Request:**

```json
{
  "items": [
    {
      "product": "prod1",
      "quantity": 2
    },
    {
      "product": "prod2",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Ship St",
    "city": "New York",
    "postalcode": "10001",
    "country": "USA"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order1",
    "totalPrice": 89.97,
    "message": "Order created successfully"
  },
  "message": "Order created. Proceed to payment."
}
```

#### 2. Checkout Order

**Route:** `POST /api/order/:orderId/checkout`

**Request:**

```json
{
  "paymentMethod": "card" // or other payment methods
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "session1",
    "paymentUrl": "https://payment.example.com/session1"
  },
  "message": "Checkout session created"
}
```

---

### REVIEW ROUTES

#### 1. Add Review

**Route:** `POST /api/review`

**Request (Auth Required, Role: User):**

```json
{
  "productId": "prod1",
  "orderId": "order1",
  "rating": 5,
  "title": "Excellent Product",
  "comment": "Great quality and fast shipping. Highly recommended!"
}
```

**Validation:**

- Rating: 1-5
- Title: 3-100 characters
- Comment: 10-1000 characters
- Must have verified purchase (from completed order)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "rev1",
    "productId": "prod1",
    "userId": "user1",
    "rating": 5,
    "title": "Excellent Product",
    "comment": "Great quality and fast shipping",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Review added successfully"
}
```

#### 2. Get Product Reviews (Public)

**Route:** `GET /api/review/:productId`

**Query Parameters:**

- `sort` (newest | oldest | rating-high | rating-low, default: newest)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "rev1",
      "rating": 5,
      "title": "Excellent Product",
      "comment": "Great quality",
      "user": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### 3. Get Seller's Product Reviews

**Route:** `GET /api/review/seller/:productId`

**Response:** Same as Get Product Reviews

---

### SELLER ORDER ROUTES (`/api/sellerorder` - Auth Required, Role: Seller)

#### 1. Get Seller Orders

**Route:** `GET /api/sellerorder`

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `status` (pending | accepted | rejected | shipped | delivered)
- `sellerStatus` (pending | accepted | rejected | completed)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "order1",
      "user": {
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "name": "Wireless Mouse",
            "price": 29.99
          },
          "quantity": 2
        }
      ],
      "totalPrice": 59.98,
      "status": "pending",
      "sellerStatus": "pending",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### 2. Accept Order

**Route:** `POST /api/sellerorder/:orderId/accept`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "order1",
    "status": "accepted",
    "sellerStatus": "accepted"
  },
  "message": "Order accepted successfully"
}
```

#### 3. Reject Order

**Route:** `POST /api/sellerorder/:orderId/reject`

**Request:**

```json
{
  "reason": "Product out of stock"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "order1",
    "sellerStatus": "rejected",
    "rejectionReason": "Product out of stock"
  },
  "message": "Order rejected"
}
```

#### 4. Complete Order

**Route:** `POST /api/sellerorder/:orderId/complete`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "order1",
    "sellerStatus": "completed"
  },
  "message": "Order completed"
}
```

#### 5. Delete Order

**Route:** `DELETE /api/sellerorder/:orderId`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Order deleted"
}
```

---

### ADMIN ROUTES (`/api/admin` - Auth Required, Role: Admin)

#### 1. Get Pending Shops

**Route:** `GET /api/admin/shops/pending`

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "shop1",
      "shopname": "My Tech Store",
      "seller": {
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "isverified": "pending",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### 2. Get All Shops

**Route:** `GET /api/admin/shops`

**Query Parameters:**

- `status` (pending | verified | rejected)
- `search` (optional)
- `page` (default: 1)
- `limit` (default: 10)

**Response:** Same structure as Get Pending Shops

#### 3. Verify Shop

**Route:** `POST /api/admin/shops/:shopId/verify`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "shop1",
    "shopname": "My Tech Store",
    "isverified": "verified"
  },
  "message": "Shop verified successfully"
}
```

#### 4. Reject Shop

**Route:** `POST /api/admin/shops/:shopId/reject`

**Request:**

```json
{
  "rejectionreason": "Insufficient documentation provided"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "shop1",
    "isverified": "rejected",
    "rejectionreason": "Insufficient documentation provided"
  },
  "message": "Shop rejected"
}
```

#### 5. Bulk Verify Shops

**Route:** `POST /api/admin/shops/bulk-verify`

**Request:**

```json
{
  "shopIds": ["shop1", "shop2", "shop3"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "verified": 3,
    "failed": 0
  },
  "message": "3 shops verified successfully"
}
```

#### 6. Delete Shop

**Route:** `DELETE /api/admin/shops/:shopId`

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Shop deleted successfully"
}
```

---

## Pages Required

### Authentication Pages

1. **Register Page** (`/register`)
   - Username, email, password fields
   - Form validation
   - Error display
   - Link to login

2. **Role Selection Page** (`/role-selection`)
   - Choose between "User" or "Seller"
   - Redirect to appropriate dashboard
   - Auto-trigger after registration

3. **Login Page** (`/login`)
   - Email and password
   - Separate admin login link
   - "Forgot password" placeholder
   - Link to register

4. **Admin Login Page** (`/admin/login`)
   - Email and password
   - Restricted to admins only

### User Pages

1. **User Profile** (`/user/profile`)
   - Edit personal information
   - Manage addresses (add, edit, delete)
   - View account settings

2. **Shop Browse** (`/shop` or `/products`)
   - Product listing with filters
   - Search functionality
   - Category filters
   - Pagination
   - Add to cart/favourites buttons

3. **Product Details** (`/product/:productId`)
   - Product images, description, price
   - Reviews section
   - Seller info
   - Add to cart button
   - Add to favourites button
   - Related products

4. **Shopping Cart** (`/cart`)
   - Cart items listing
   - Quantity adjustment
   - Remove items
   - Order summary
   - Proceed to checkout

5. **Checkout** (`/checkout`)
   - Select/add shipping address
   - Review order
   - Choose payment method
   - Process payment

6. **Orders** (`/user/orders`)
   - List of all orders
   - Order status tracking
   - Order details
   - Leave review button (after delivery)

7. **Favourites** (`/user/favourites`)
   - List favourite products
   - Remove from favourites
   - Add to cart directly

### Seller Pages

1. **Seller Dashboard** (`/seller/dashboard`)
   - Sales stats
   - Revenue overview
   - Recent orders
   - Low stock alerts

2. **Shop Setup/Management** (`/seller/shop`)
   - Create shop (if new)
   - Edit shop details
   - View shop verification status

3. **Products Management** (`/seller/products`)
   - List all products
   - Add new product
   - Edit product
   - Delete product
   - Toggle product status
   - Search and filter

4. **Inventory Management** (`/seller/inventory`)
   - Stock levels
   - Low stock alerts
   - Update stock

5. **Orders Management** (`/seller/orders`)
   - List orders
   - Filter by status
   - Accept/Reject orders
   - Mark as completed
   - View order details

6. **Reviews/Ratings** (`/seller/reviews`)
   - View product reviews
   - Seller ratings
   - Review statistics

7. **Earnings/Transactions** (`/seller/earnings`)
   - Revenue summary
   - Transaction history
   - Payment distribution records

### Admin Pages

1. **Admin Dashboard** (`/admin/dashboard`)
   - Platform statistics
   - Total users, sellers, products
   - Transaction volume
   - Pending verifications count

2. **Shop Verification** (`/admin/shops`)
   - List all shops
   - Filter by status (pending, verified, rejected)
   - Verify/Reject shops
   - Bulk operations
   - Search shops

3. **Users Management** (`/admin/users`)
   - List all users
   - User details
   - Block/Unblock users (if implemented)

4. **Reports** (`/admin/reports`)
   - Sales reports
   - User activity
   - Seller performance

---

## Components Required

### Layout Components

- **Navbar** - Navigation with auth state, user menu
- **Sidebar** - Dashboard navigation (user/seller/admin specific)
- **Footer** - Footer with links
- **Layout** - Main layout wrapper

### Auth Components

- **LoginForm** - Login form with validation
- **RegisterForm** - Registration form
- **RoleSelector** - Role selection component
- **ProtectedRoute** - Route protection based on auth/role

### Product Components

- **ProductCard** - Single product card with price, rating
- **ProductList** - List/grid of products
- **ProductFilter** - Filter and search controls
- **ProductDetails** - Detailed product view
- **ReviewCard** - Single review display
- **ReviewList** - List of reviews
- **AddReview** - Review submission form
- **RatingStars** - Star rating display/input

### Cart Components

- **CartItem** - Single cart item
- **CartSummary** - Cart totals, tax, shipping
- **CartEmpty** - Empty cart message
- **Checkout** - Checkout flow component

### Order Components

- **OrderCard** - Order status display
- **OrderList** - List of orders
- **OrderDetails** - Detailed order view
- **OrderTracking** - Order status tracker
- **PaymentForm** - Payment processing form

### Seller Components

- **ProductForm** - Add/Edit product form
- **InventoryTable** - Inventory display
- **SellerOrderCard** - Order for seller view
- **ShopForm** - Create/Edit shop form
- **StatsCard** - Stats display (revenue, orders, etc.)
- **RevenueChart** - Revenue visualization

### Admin Components

- **ShopCard** - Shop verification card
- **ShopList** - List of shops for verification
- **BulkVerify** - Bulk verification form
- **UserTable** - Admin users table
- **StatsOverview** - Dashboard statistics

### Common Components

- **Modal** - Modal dialog
- **Toast/Alert** - Notifications
- **Loading** - Loading spinner
- **Pagination** - Pagination controls
- **SearchBar** - Search input
- **Button** - Reusable button
- **Icon** - Icon wrapper
- **Breadcrumb** - Navigation breadcrumb
- **EmptyState** - Empty state display

---

## State Management

### Using Context API (Recommended for this project size)

#### AuthContext

```javascript
{
  user: null,          // {id, email, role, token}
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login(email, password),
  register(username, email, password),
  logout(),
  setRole(role)
}
```

#### UserContext

```javascript
{
  profile: null,       // User profile data
  addresses: [],       // User addresses
  isLoading: false,
  error: null,
  updateProfile(data),
  addAddress(address),
  updateAddress(id, data),
  deleteAddress(id),
  fetchProfile()
}
```

#### CartContext

```javascript
{
  items: [],           // Cart items
  total: 0,
  addItem(product, quantity),
  removeItem(productId),
  updateQuantity(productId, quantity),
  clearCart(),
  getCartTotal()
}
```

---

## Data Structures

### User Object

```javascript
{
  _id: "userId123",
  username: "john_doe",
  email: "john@example.com",
  firstname: "John",
  lastname: "Doe",
  phonenumber: "+123456789",
  dob: "1990-01-15",
  role: "user" | "seller" | "admin",
  addresses: [
    {
      _id: "addr1",
      street: "123 Main St",
      city: "New York",
      postalcode: "10001",
      country: "USA",
      isdefault: true
    }
  ],
  createdAt: "2024-01-15T10:00:00Z"
}
```

### Product Object

```javascript
{
  _id: "prod1",
  name: "Wireless Mouse",
  description: "Comfortable wireless mouse",
  price: 29.99,
  category: "Accessories",
  totalStock: 100,
  status: "active" | "inactive" | "discontinued",
  seller: {
    _id: "seller1",
    shopname: "TechStore"
  },
  rating: 4.5,
  reviews: 15,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

### Order Object

```javascript
{
  _id: "order1",
  user: "user1",
  seller: "seller1",
  items: [
    {
      product: "prod1",
      quantity: 2,
      price: 29.99
    }
  ],
  totalPrice: 59.98,
  totalAmount: 59.98,
  status: "pending" | "accepted" | "shipped" | "delivered",
  sellerStatus: "pending" | "accepted" | "rejected" | "completed",
  paymentStatus: "pending" | "paid" | "failed",
  shippingAddress: {
    street: "123 Ship St",
    city: "New York",
    postalcode: "10001",
    country: "USA"
  },
  createdAt: "2024-01-15T10:00:00Z",
  deliveredAt: null
}
```

### Shop Object

```javascript
{
  _id: "shop1",
  seller: "seller1",
  shopname: "My Tech Store",
  description: "Premium electronics seller",
  email: "shop@example.com",
  phonenumber: "+1234567890",
  isverified: "pending" | "verified" | "rejected",
  totalRevenue: 5000,
  earnings: 4500,
  rating: 4.7,
  transactions: [
    {
      type: "delivery_payment",
      amount: 500,
      date: "2024-01-15T10:00:00Z"
    }
  ],
  createdAt: "2024-01-15T10:00:00Z"
}
```

---

## Development Best Practices

### API Service Setup

```javascript
// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add token to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
```

### Error Handling

- Validate all form inputs before submission
- Display meaningful error messages
- Handle network errors gracefully
- Show loading states during API calls

### Security

- Store tokens in localStorage/sessionStorage
- Include token in Authorization header for auth-required routes
- Validate user roles before showing pages/actions
- Sanitize user input

### Performance

- Implement pagination for large lists
- Lazy load images
- Use React.memo for expensive components
- Debounce search queries
- Cache frequently accessed data

---

## Testing Checklist

### Authentication Flow

- [ ] Register with valid credentials
- [ ] Register with invalid email
- [ ] Register with weak password
- [ ] Set role after registration
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Protected routes redirect to login

### User Functionality

- [ ] Complete profile
- [ ] Add/Edit/Delete addresses
- [ ] View profile
- [ ] Manage favourites
- [ ] View orders

### Seller Functionality

- [ ] Create shop
- [ ] Edit shop details
- [ ] Add products
- [ ] Edit products
- [ ] Delete products
- [ ] Update inventory
- [ ] Accept/Reject orders
- [ ] View earnings

### Admin Functionality

- [ ] View pending shops
- [ ] Verify shops
- [ ] Reject shops
- [ ] Bulk verify
- [ ] Delete shops

### General

- [ ] Search functionality
- [ ] Filter products by category
- [ ] Pagination works correctly
- [ ] Add to cart/favourites
- [ ] Checkout process
- [ ] Review submission
- [ ] Responsive design

---

## Installation & Running

```bash
# Install dependencies
npm install

# Set up environment variables
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Additional Notes

- Always use the auth token from localStorage
- Implement proper error boundary components
- Create reusable hooks for common API calls
- Follow component composition patterns
- Use proper TypeScript types if using TypeScript
- Implement auto-logout on token expiration
- Add real-time notifications for seller orders
