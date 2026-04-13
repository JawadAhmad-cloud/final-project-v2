# Frontend Developer Documentation

## System Overview

**Base URL:** `http://localhost:5000/api`

**Tech Stack:**

- Express.js (REST API)
- MongoDB (Database)
- Socket.io (Real-time notifications)
- JWT (Authentication)

---

## System Capacity

**Current Single Server Setup:**

- Concurrent Users: ~5,000-10,000
- Requests/second: ~100-500 (depending on database query complexity)
- Real-time connections: Limited to Node.js event loop capacity (typically 10,000-50,000 concurrent sockets)

**Bottlenecks:**

1. Single MongoDB instance
2. No caching layer (Redis)
3. Single Node.js process (no clustering)
4. No load balancing

**For Production (100,000+ users):**

- Implement Redis caching
- Use PM2 clustering or Kubernetes
- Add load balancer (Nginx/HAProxy)
- Database replication & sharding
- CDN for static assets

---

## Why HTTP Server Instead of Express Server?

Socket.io requires control over the HTTP server instance. Here's why:

```javascript
// ❌ WRONG - Socket.io can't access Express server directly
const app = express();
const io = socketIO(app); // Won't work properly

// ✅ CORRECT - Create HTTP server first
const server = http.createServer(app);
const io = socketIO(server);
server.listen(5000);
```

**Reasons:**

1. **WebSocket Upgrade** - HTTP server handles the upgrade to WebSocket protocol
2. **Socket Management** - Direct control over socket lifecycle
3. **CORS Configuration** - Socket.io needs HTTP server for CORS headers
4. **Connection Handling** - Proper connection pooling and management
5. **Standard Practice** - Industry-standard approach for Socket.io integration

---

## Authentication System

### JWT Token

- **Parameter:** `Authorization: Bearer <token>` (Header)
- **Storage:** localStorage (frontend responsibility)
- **Expiry:** Check token response
- **Validation:** Sent with every protected request

### User Roles

1. **user** - Regular customer
2. **seller** - Shop owner selling products
3. **admin** - System administrator

### Authentication Flow

```
1. User registers/logs in
2. Backend returns JWT token
3. Store token in localStorage
4. Send token in Authorization header for all requests
5. Middleware validates token before processing
```

---

## API Routes Reference

### 1. AUTHENTICATION ROUTES (`/api/auth`)

#### Register New User

```
POST /api/auth/register
Body: {
  username: String (3-30 chars, unique),
  email: String (valid email, unique),
  password: String (min 6 chars, must have uppercase, lowercase, number)
}
Response: {
  success: Boolean,
  data: {
    id: String,
    username: String,
    email: String,
    token: String (JWT)
  },
  message: String
}
```

#### User Login

```
POST /api/auth/login
Body: {
  email: String,
  password: String
}
Response: {
  success: Boolean,
  data: {
    id: String,
    username: String,
    email: String,
    role: String (user/seller/admin),
    token: String (JWT)
  },
  message: String
}
```

#### Set User Role (After Registration)

```
POST /api/auth/set-role
Headers: Authorization: Bearer <token>
Body: {
  role: String (user or seller)
}
Response: {
  success: Boolean,
  data: { role: String },
  message: String
}
```

#### Admin Login

```
POST /api/auth/admin-login
Body: {
  email: String,
  password: String
}
Response: {
  success: Boolean,
  data: {
    id: String,
    email: String,
    role: "admin",
    token: String (JWT)
  },
  message: String
}
Note: Only admin users can login here
```

#### Logout

```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: {
  success: Boolean,
  message: String
}
Note: Clear localStorage token on frontend
```

---

### 2. USER PROFILE ROUTES (`/api/user`)

**Middleware:** Authentication Required

#### Complete User Profile

```
POST /api/user/profile/complete
Body: {
  firstname: String (required),
  lastname: String (required),
  phonenumber: String (10-15 digits, required),
  dob: Date (required)
}
Response: {
  success: Boolean,
  data: {
    id: String,
    firstname: String,
    lastname: String,
    phonenumber: String,
    dob: Date
  },
  message: String
}
```

#### Get User Profile

```
GET /api/user/profile
Response: {
  success: Boolean,
  data: {
    id: String,
    username: String,
    email: String,
    firstname: String,
    lastname: String,
    phonenumber: String,
    dob: Date,
    role: String,
    addresses: Array,
    isactive: Boolean,
    isverified: Boolean
  },
  message: String
}
```

#### Add Address

```
POST /api/user/address
Body: {
  street: String (required),
  city: String (required),
  postalcode: String (required),
  country: String (required),
  isdefault: Boolean (optional)
}
Response: {
  success: Boolean,
  data: {
    id: String,
    addresses: Array
  },
  message: String
}
```

#### Update Address

```
PUT /api/user/address/:addressId
Body: {
  street: String (optional),
  city: String (optional),
  postalcode: String (optional),
  country: String (optional),
  isdefault: Boolean (optional)
}
Response: {
  success: Boolean,
  data: { addresses: Array },
  message: String
}
```

#### Delete Address

```
DELETE /api/user/address/:addressId
Response: {
  success: Boolean,
  message: String
}
```

---

### 3. PRODUCT ROUTES (Public)

#### Get All Products (Public - No Auth)

```
GET /api/product?page=1&limit=20&search=&category=

Query Parameters:
  page: Number (default: 1)
  limit: Number (default: 20)
  search: String (search by name)
  category: String (filter by category)

Response: {
  success: Boolean,
  data: [
    {
      _id: String,
      name: String,
      description: String,
      price: Number,
      category: String,
      totalStock: Number,
      seller: { shopname: String },
      rating: Number,
      createdAt: Date
    }
  ],
  pagination: {
    total: Number,
    page: Number,
    limit: Number,
    pages: Number
  },
  message: String
}
```

#### Get Product Details (Public - No Auth)

```
GET /api/product/:productId
Response: {
  success: Boolean,
  data: {
    _id: String,
    name: String,
    description: String,
    price: Number,
    category: String,
    totalStock: Number,
    seller: {
      shopname: String,
      shopaddress: Object,
      contact: String,
      rating: Number
    },
    rating: Number,
    reviews: Array,
    createdAt: Date
  },
  message: String
}
```

---

### 4. SELLER ROUTES (`/api/seller`)

**Middleware:** Authentication Required + Role: seller

#### Create Shop

```
POST /api/seller/shop
Body: {
  shopname: String (required),
  description: String (required),
  email: String (required),
  phonenumber: String (required),
  shopaddress: {
    street: String,
    city: String,
    postalcode: String,
    country: String
  },
  buyingaddress: {
    street: String,
    city: String,
    postalcode: String,
    country: String
  }
}
Response: {
  success: Boolean,
  data: {
    id: String,
    shopname: String,
    isverified: "pending"
  },
  message: String
}
```

#### Get Shop Details

```
GET /api/seller/shop
Response: {
  success: Boolean,
  data: {
    id: String,
    shopname: String,
    description: String,
    email: String,
    phonenumber: String,
    shopaddress: Object,
    buyingaddress: Object,
    isverified: String (pending/verified/rejected),
    rating: Number,
    createdAt: Date
  },
  message: String
}
```

#### Update Shop

```
PUT /api/seller/shop
Body: {
  shopname: String (optional),
  description: String (optional),
  email: String (optional),
  phonenumber: String (optional),
  shopaddress: Object (optional),
  buyingaddress: Object (optional)
}
Response: {
  success: Boolean,
  data: { shop object },
  message: String
}
```

---

### 5. SELLER PRODUCT ROUTES (`/api/seller/products`)

**Middleware:** Authentication Required + Role: seller

#### Add Product

```
POST /api/seller/products
Body: {
  name: String (required),
  description: String (required),
  price: Number (required),
  category: String (required),
  totalStock: Number (required)
}
Response: {
  success: Boolean,
  data: {
    id: String,
    name: String,
    price: Number,
    totalStock: Number,
    status: "active"
  },
  message: String
}
```

#### Get All Seller Products

```
GET /api/seller/products?page=1&limit=10&search=&category=&status=

Query Parameters:
  page: Number (default: 1)
  limit: Number (default: 10)
  search: String
  category: String
  status: String (active/inactive/discontinued)

Response: {
  success: Boolean,
  data: [
    {
      _id: String,
      name: String,
      description: String,
      price: Number,
      category: String,
      totalStock: Number,
      status: String,
      rating: Number,
      createdAt: Date
    }
  ],
  pagination: { ... },
  message: String
}
```

#### Get Product Details

```
GET /api/seller/products/:productId
Response: {
  success: Boolean,
  data: {
    _id: String,
    name: String,
    description: String,
    price: Number,
    category: String,
    totalStock: Number,
    status: String,
    rating: Number,
    createdAt: Date
  },
  message: String
}
```

#### Update Product

```
PUT /api/seller/products/:productId
Body: {
  name: String (optional),
  description: String (optional),
  price: Number (optional),
  category: String (optional),
  totalStock: Number (optional)
}
Response: {
  success: Boolean,
  data: { updated product object },
  message: String
}
```

#### Delete Product

```
DELETE /api/seller/products/:productId
Response: {
  success: Boolean,
  message: String
}
```

#### Toggle Product Status

```
PUT /api/seller/products/:productId/status
Body: {
  status: String (active/inactive/discontinued)
}
Response: {
  success: Boolean,
  data: { product object },
  message: String
}
```

---

### 6. INVENTORY ROUTES (`/api/seller/inventory`)

**Middleware:** Authentication Required + Role: seller

#### Get Inventory

```
GET /api/seller/inventory?page=1&limit=10

Query Parameters:
  page: Number (default: 1)
  limit: Number (default: 10)

Response: {
  success: Boolean,
  data: {
    inventory: [
      {
        _id: String,
        name: String,
        totalStock: Number,
        price: Number,
        status: String
      }
    ],
    summary: {
      totalProducts: Number,
      totalStock: Number,
      lowStockItems: Number
    }
  },
  message: String
}
```

#### Get Low Stock Products

```
GET /api/seller/inventory/low-stock?threshold=10

Query Parameters:
  threshold: Number (default: 10)

Response: {
  success: Boolean,
  data: [
    {
      _id: String,
      name: String,
      totalStock: Number,
      threshold: Number
    }
  ],
  message: String
}
```

#### Update Product Stock

```
PUT /api/seller/inventory/stock/:productId
Body: {
  totalStock: Number (required)
}
Response: {
  success: Boolean,
  data: {
    _id: String,
    name: String,
    totalStock: Number
  },
  message: String
}
```

---

### 7. ORDER ROUTES (User Orders) (`/api/order`)

**Middleware:** Authentication Required

#### Create Order

```
POST /api/order
Body: {
  items: [
    {
      product: String (product ID),
      quantity: Number
    }
  ],
  shippingAddress: {
    street: String,
    city: String,
    postalcode: String,
    country: String,
    phonenumber: String
  }
}
Response: {
  success: Boolean,
  data: {
    orderId: String,
    totalPrice: Number,
    message: "Order created successfully"
  },
  message: "Order created. Proceed to payment."
}
NOTE: Socket.io will notify seller immediately after order creation
```

#### Create Checkout Session

```
POST /api/order/:orderId/checkout
Body: {
  paymentMethod: String (default: "card")
}
Response: {
  success: Boolean,
  data: {
    checkoutId: String,
    orderId: String,
    totalAmount: Number
  },
  message: String
}
```

#### Process Payment

```
POST /api/order/payment/process
Body: {
  checkoutId: String,
  cardNumber: String,
  expiryDate: String (MM/YY),
  cvv: String
}
Response: {
  success: Boolean,
  data: {
    paymentId: String,
    status: String (success/failed)
  },
  message: String
}
```

---

### 8. SELLER ORDER ROUTES (`/api/seller/orders`)

**Middleware:** Authentication Required + Role: seller

#### Get Seller Orders

```
GET /api/seller/orders?page=1&limit=10&status=&sellerStatus=

Query Parameters:
  page: Number (default: 1)
  limit: Number (default: 10)
  status: String (pending/accepted/rejected/shipped/delivered)
  sellerStatus: String (pending/accepted/rejected/completed)

Response: {
  success: Boolean,
  data: {
    orders: [
      {
        _id: String,
        orderId: String,
        user: { username: String },
        items: Array,
        totalAmount: Number,
        status: String,
        sellerStatus: String,
        shippingAddress: Object,
        createdAt: Date
      }
    ],
    pagination: { ... }
  },
  message: String
}
```

#### Accept Order

```
POST /api/seller/orders/:orderId/accept
Response: {
  success: Boolean,
  data: {
    orderId: String,
    status: "accepted",
    sellerStatus: "accepted"
  },
  message: String
}
NOTE: Socket.io will emit status update
```

#### Reject Order

```
POST /api/seller/orders/:orderId/reject
Response: {
  success: Boolean,
  data: {
    orderId: String,
    status: "rejected",
    sellerStatus: "rejected"
  },
  message: String
}
NOTE: Socket.io will emit status update
```

#### Complete Order

```
POST /api/seller/orders/:orderId/complete
Response: {
  success: Boolean,
  data: {
    orderId: String,
    status: "delivered",
    sellerStatus: "completed"
  },
  message: String
}
NOTE: Socket.io will emit status update
```

#### Delete Order (Completed Orders Only)

```
DELETE /api/seller/orders/:orderId
Response: {
  success: Boolean,
  message: String
}
```

---

### 9. FAVOURITES ROUTES (`/api/favourite`)

**Middleware:** Authentication Required

#### Add to Favourites

```
POST /api/favourite/add
Body: {
  productId: String (required)
}
Response: {
  success: Boolean,
  data: { favourite object },
  message: String
}
```

#### Get Favourites

```
GET /api/favourite
Response: {
  success: Boolean,
  data: {
    _id: String,
    user: String,
    products: [
      {
        _id: String,
        name: String,
        price: Number,
        seller: { shopname: String }
      }
    ]
  },
  message: String
}
```

#### Remove from Favourites

```
DELETE /api/favourite/:productId
Response: {
  success: Boolean,
  message: String
}
```

#### Clear All Favourites

```
DELETE /api/favourite/clear
Response: {
  success: Boolean,
  message: String
}
```

---

### 10. REVIEWS ROUTES (`/api/reviews`)

#### Add Review (Auth Required)

```
POST /api/reviews
Headers: Authorization: Bearer <token>
Body: {
  productId: String (required),
  orderId: String (required - for verified purchase),
  rating: Number (1-5, required),
  title: String (3-100 chars, required),
  comment: String (10-1000 chars, required)
}
Response: {
  success: Boolean,
  data: {
    _id: String,
    product: String,
    rating: Number,
    title: String,
    comment: String,
    createdAt: Date
  },
  message: String
}
NOTE: Only users with purchased this product can review
```

#### Get Product Reviews (Public - No Auth)

```
GET /api/reviews/:productId?sort=newest

Query Parameters:
  sort: String (newest/oldest/rating-high/rating-low, default: newest)

Response: {
  success: Boolean,
  data: [
    {
      _id: String,
      product: String,
      user: { username: String },
      rating: Number,
      title: String,
      comment: String,
      createdAt: Date
    }
  ],
  message: String
}
```

---

### 11. ADMIN ROUTES (`/api/admin`)

**Middleware:** Authentication Required + Role: admin

#### Get Pending Shops

```
GET /api/admin/shops/pending?page=1&limit=10&search=

Query Parameters:
  page: Number (default: 1)
  limit: Number (default: 10)
  search: String (search by shop name)

Response: {
  success: Boolean,
  data: {
    shops: [
      {
        _id: String,
        shopname: String,
        email: String,
        isverified: "pending",
        owner: { username: String },
        createdAt: Date
      }
    ],
    pagination: { ... }
  },
  message: String
}
```

#### Get All Shops

```
GET /api/admin/shops?status=&search=&page=1&limit=10

Query Parameters:
  status: String (pending/verified/rejected)
  search: String
  page: Number (default: 1)
  limit: Number (default: 10)

Response: {
  success: Boolean,
  data: { shops: Array, pagination: Object },
  message: String
}
```

#### Verify Shop

```
POST /api/admin/shops/:shopId/verify
Response: {
  success: Boolean,
  data: {
    _id: String,
    shopname: String,
    isverified: "verified"
  },
  message: String
}
```

#### Reject Shop

```
POST /api/admin/shops/:shopId/reject
Body: {
  reason: String (optional)
}
Response: {
  success: Boolean,
  data: {
    _id: String,
    shopname: String,
    isverified: "rejected"
  },
  message: String
}
```

#### Delete Shop

```
DELETE /api/admin/shops/:shopId
Response: {
  success: Boolean,
  message: String
}
```

#### Bulk Verify Shops

```
POST /api/admin/shops/bulk-verify
Body: {
  shopIds: Array of String
}
Response: {
  success: Boolean,
  data: {
    verified: Number,
    failed: Number
  },
  message: String
}
```

---

## Socket.io Real-Time Communication

### Connection Setup (Seller)

```javascript
// Import Socket.io client
import io from "socket.io-client";

// Initialize connection
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Authenticate with seller token
socket.emit("seller-auth", "YOUR_JWT_TOKEN");

// Listen for authentication response
socket.on("auth-success", (data) => {
  console.log("Connected:", data.message); // "Authenticated"
});

socket.on("auth-error", (data) => {
  console.error("Auth failed:", data.message);
  // Reconnect or redirect to login
});
```

### Socket Events

#### 1. New Order Received (For Sellers)

```javascript
socket.on('new-order', (data) => {
  // Response payload:
  {
    orderId: String,       // Order ID
    userId: String,        // Customer ID
    totalAmount: Number,   // Order total price
    itemCount: Number,     // Number of items
    status: String,        // "pending"
    createdAt: Date,       // Order creation time
    message: String        // "New order received!"
  }

  // Example: Show notification to seller
  console.log(`New order ${data.orderId} for $${data.totalAmount}`);
  showNotification(`New order received!`);
});
```

#### 2. Order Status Update

```javascript
socket.on('order-update', (data) => {
  // Response payload:
  {
    orderId: String,      // Order ID
    action: String,       // "accepted", "rejected", "completed"
    status: String,       // Current order status
    sellerStatus: String, // Seller's status
    message: String       // "Order has been {action}"
  }

  // Example: Update UI
  updateOrderStatus(data.orderId, data.sellerStatus);
});
```

#### 3. Generic Notification Event

```javascript
socket.on(eventName, (data) => {
  // For custom events sent by backend
  console.log(`Notification: ${eventName}`, data);
});
```

### Socket Lifecycle

```javascript
// Connection established
socket.on("connect", () => {
  console.log("Connected to server");
});

// Disconnected
socket.on("disconnect", () => {
  console.log("Disconnected from server");
  // Automatic reconnection will be attempted
});

// Reconnection attempt
socket.on("reconnect_attempt", () => {
  console.log("Attempting to reconnect...");
});

// Reconnection successful
socket.on("reconnect", () => {
  console.log("Reconnected to server");
  // Re-authenticate if needed
  socket.emit("seller-auth", "YOUR_JWT_TOKEN");
});

// Error
socket.on("error", (error) => {
  console.error("Socket error:", error);
});
```

---

## Error Handling

### Response Format

All endpoints follow this response structure:

```javascript
{
  success: Boolean,
  data: Object|Array|null,
  message: String,
  error: String (only in development)
}
```

### Common Error Codes

- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error

### Example Error Response

```javascript
Response: {
  success: false,
  data: null,
  message: "Order not found",
  error: "undefined" // Only in development
}
```

---

## Data Models Overview

### User Model

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstname: String,
  lastname: String,
  phonenumber: String,
  dob: Date,
  role: String (user/seller/admin),
  addresses: [{
    street: String,
    city: String,
    postalcode: String,
    country: String,
    isdefault: Boolean
  }],
  isactive: Boolean,
  isverified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  totalStock: Number,
  seller: ObjectId (ref: Shop),
  status: String (active/inactive/discontinued),
  rating: Number,
  reviews: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  seller: ObjectId (ref: Shop),
  items: [{
    product: ObjectId,
    quantity: Number
  }],
  shippingAddress: {
    street: String,
    city: String,
    postalcode: String,
    country: String,
    phonenumber: String
  },
  status: String (pending/accepted/rejected/shipped/delivered/cancelled),
  sellerStatus: String (pending/accepted/rejected/completed),
  totalAmount: Number,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Shop Model

```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  shopname: String,
  description: String,
  email: String,
  phonenumber: String,
  shopaddress: Object,
  buyingaddress: Object,
  isverified: String (pending/verified/rejected),
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Best Practices

### 1. Token Management

```javascript
// Store token on successful login
localStorage.setItem("authToken", response.data.token);

// Include in all requests
const headers = {
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
};

// Clear on logout
localStorage.removeItem("authToken");
```

### 2. Error Handling

```javascript
try {
  const response = await fetch("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, redirect to login
      redirectToLogin();
    } else if (response.status === 403) {
      // Insufficient permissions
      showError("You do not have permission");
    }
  }

  const data = await response.json();
  if (!data.success) {
    showError(data.message);
  }
} catch (error) {
  showError("Network error");
}
```

### 3. Socket Setup on App Load

```javascript
// In your main app component
useEffect(() => {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  if (userRole === "seller") {
    const socket = io("http://localhost:5000");
    socket.emit("seller-auth", token);

    socket.on("new-order", handleNewOrder);
    socket.on("order-update", handleOrderUpdate);

    return () => socket.disconnect();
  }
}, []);
```

### 4. Pagination

```javascript
// Fetch products with pagination
const fetchProducts = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/product?page=${page}&limit=${limit}`, {
    headers,
  });

  const data = await response.json();

  if (data.success) {
    setProducts(data.data);
    setPagination(data.pagination);
  }
};
```

---

## Example Client Implementation

### React Setup Example

```jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

function SellerDashboard() {
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    // Connect socket
    const newSocket = io("http://localhost:5000");
    newSocket.emit("seller-auth", token);

    // Listen for new orders
    newSocket.on("new-order", (orderData) => {
      alert(`New order ${orderData.orderId} received!`);
      fetchOrders(); // Refresh orders list
    });

    // Listen for order updates
    newSocket.on("order-update", (updateData) => {
      console.log(
        `Order ${updateData.orderId} status: ${updateData.sellerStatus}`,
      );
      fetchOrders();
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [token]);

  const fetchOrders = async () => {
    const response = await fetch("/api/seller/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) {
      setOrders(data.data.orders);
    }
  };

  const acceptOrder = async (orderId) => {
    const response = await fetch(`/api/seller/orders/${orderId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) {
      // Socket will notify of status change
      console.log("Order accepted");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order._id}>
          <p>Order: {order.orderId}</p>
          <p>Amount: ${order.totalAmount}</p>
          <p>Status: {order.sellerStatus}</p>
          <button onClick={() => acceptOrder(order._id)}>Accept</button>
        </div>
      ))}
    </div>
  );
}

export default SellerDashboard;
```

---

## Testing Endpoints

You can test endpoints using Postman or curl:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Get protected resource
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create order
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"product": "PRODUCT_ID", "quantity": 2}],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "NYC",
      "postalcode": "10001",
      "country": "USA",
      "phonenumber": "1234567890"
    }
  }'
```

---

## Support & Debugging

### Check Server Status

```
GET http://localhost:5000/api/auth/login
// Server responds with error → means server is running
```

### Enable Debugging

Set `NODE_ENV=development` in .env for detailed error messages

### Socket Connection Issues

1. Ensure server is running on port 5000
2. Check token validity
3. Verify seller role is set
4. Check browser console for errors
5. Use browser DevTools Network tab to see WebSocket connection

---

**Last Updated:** April 2026
**Backend Version:** 1.0.0
