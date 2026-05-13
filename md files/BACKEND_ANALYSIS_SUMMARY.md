# Backend Architecture Analysis

## 1. EXISTING ROUTES

### Order Routes (`routes/order.routes.js`)

✅ **POST** `/`

- Creates order from cart items
- Input: `items[]`, `shippingAddress`
- Output: `orderId`, `totalPrice`
- Status: pending

✅ **POST** `/:orderId/checkout`

- Creates checkout session for payment
- Input: `orderId`, `paymentMethod` (optional)
- Validates order is accepted by seller before allowing checkout
- Output: Checkout session details

✅ **POST** `/payment/process`

- Processes payment after checkout
- Input: `checkoutId`, `cardNumber`, `expiryDate`, `cvv`
- Output: Payment confirmation, transaction ID
- Updates order `paymentStatus` to "paid"

✅ **POST** `/ship/:orderId`

- Ships order (seller action)
- Input: `origin`, `destination`, `weight` (optional)
- Requires: Payment must be completed (`paymentStatus` === "paid")
- Calls TCS service to create shipment
- Output: Tracking number, estimated delivery date

✅ **GET** `/tracking/:trackingNumber`

- Retrieves shipment tracking status
- Output: Tracking number, status, estimated delivery, current location
- Simulates automatic delivery after 1 minute (configurable)

✅ **GET** `/invoice/:orderId`

- Generates invoice for completed order
- Output: Invoice details

### Seller Routes (`routes/seller.routes.js`)

✅ **POST** `/shop`

- Creates shop for seller
- Input: `shopname`, `description`, `email`, `phonenumber`, `shopaddress`, `buyingaddress`
- Output: Shop details with `isverified: "pending"`

✅ **GET** `/shop`

- Gets authenticated seller's shop details
- Output: Full shop profile with all fields

✅ **PUT** `/shop`

- Updates seller's shop information
- Input: Any shop fields (all optional)
- Output: Updated shop details

### Seller Order Routes (`routes/sellerorder.routes.js`)

✅ **GET** `/`

- Gets seller's orders with pagination
- Query params: `page`, `limit`, `status`, `sellerStatus`
- Filters available: pending, accepted, rejected, shipped, delivered

✅ **POST** `/:orderId/accept`

- Seller accepts order
- Updates `sellerStatus` to "accepted"

✅ **POST** `/:orderId/reject`

- Seller rejects order
- Updates `sellerStatus` to "rejected"

✅ **POST** `/:orderId/complete`

- Seller marks order as completed
- Updates `sellerStatus` to "completed"

✅ **DELETE** `/:orderId`

- Deletes completed order (archive)

### Admin Routes (`routes/admin.routes.js`)

✅ **GET** `/shops/pending`

- Gets all shops awaiting verification
- Pagination & search supported

✅ **GET** `/shops`

- Gets all shops with filtering
- Filters: `status` (pending/verified/rejected), `search`, pagination

✅ **POST** `/shops/:shopId/verify`

- Verifies a shop (sets `isverified` to "verified")

✅ **POST** `/shops/:shopId/reject`

- Rejects shop with reason
- Sets `isverified` to "rejected" and stores `rejectionreason`

✅ **POST** `/shops/bulk-verify`

- Bulk verifies multiple shops
- Input: Array of `shopIds`

✅ **DELETE** `/shops/:shopId`

- Deletes shop permanently

### Public Product Routes (`routes/public-product.routes.js`)

✅ **GET** `/`

- Gets all active products (no auth required)
- Pagination & search supported
- Returns: product ID, name, description, price, category, stock, seller (shopname), rating

✅ **GET** `/:productId`

- Gets product details by ID (public)
- Populates seller info: `shopname`, `shopaddress`, `contact`, `rating`
- Includes reviews with reviewer info

---

## 2. EXISTING MODELS

### Order Model (`model/order.model.js`)

```
{
  user: ObjectId (ref: User),           // Buyer
  seller: ObjectId (ref: Shop),         // Seller/Shop
  items: [{
    product: ObjectId,
    quantity: Number
  }],
  shippingAddress: {
    street, city, postalcode, country, phonenumber
  },
  status: enum [pending, accepted, rejected, shipped, delivered, cancelled],
  sellerStatus: enum [pending, accepted, rejected, completed],
  totalAmount: Number,
  totalPrice: Number,
  shipping: {
    trackingNumber: String,
    status: enum [pending, in_transit, delivered],
    estimatedDelivery: Date,
    deliveredAt: Date,
    createdAt: Date
  },
  payment: {
    checkoutSessionId: ObjectId (ref: Payment),
    status: enum [pending, paid, failed, refunded],
    transactionId: String,
    paidAt: Date
  },
  paymentStatus: enum [pending, paid, failed, refunded],
  timestamps: true
}
```

### Shop Model (`model/shop.model.js`)

```
{
  seller: ObjectId (ref: User, unique),
  shopname: String,
  description: String,
  products: [ObjectId (ref: Product)],
  contact: {
    email: String,
    phonenumber: String
  },
  shopaddress: {
    street, city, postalcode, country
  },
  buyingaddress: {
    street, city, postalcode, country
  },
  isverified: enum [pending, verified, rejected],
  rejectionreason: String,
  rating: Number (0-5),
  totalRevenue: Number,
  earnings: Number,
  transactions: [{
    type: enum [payment, refund, fee],
    amount: Number,
    date: Date,
    paymentId: ObjectId (ref: Payment),
    description: String
  }],
  timestamps: true
}
```

### Payment Model (`model/payment.model.js`)

```
{
  orderId: ObjectId (ref: Order),
  amount: Number,
  platformFee: Number,
  sellerAmount: Number,
  status: enum [pending, paid, failed, refunded],
  paymentMethod: enum [card, bank_transfer, wallet],
  transactionId: String,
  checkoutData: {
    cardName, cardNumber (masked), expiryDate
  },
  paidAt: Date,
  distributedToSeller: Boolean (default: false),
  distributedAt: Date,
  refundInfo: {
    amount, date, reason
  },
  timestamps: true
}
```

---

## 3. TCS SERVICE (`services/tcs.service.js`) - Shipping & Payment Distribution

### `createShipment(orderId, shipmentData)`

- Creates shipment with tracking number
- Updates order: `shipping.trackingNumber`, `shipping.status = "in_transit"`, `status = "shipped"`
- Sets estimated delivery to 1 minute from now (for testing, originally 5 days)
- Returns: tracking number, status, estimated delivery

### `getShipmentStatus(trackingNumber)`

- Retrieves order by tracking number
- Simulates delivery status:
  - If > 1 minute elapsed: marks as "delivered"
  - Calls `distributePaymentToSeller()` upon delivery
- Returns: tracking number, status, estimated delivery, current location

### `distributePaymentToSeller(orderId)`

- **Triggered when order is delivered**
- Platform fee: 10% of payment amount
- Seller receives: 90% of payment amount
- Updates Shop model: `totalRevenue`, `earnings`, adds transaction record
- Marks payment as `distributedToSeller = true`
- Records: distribution date, seller amount, platform fee

---

## 4. MISSING IMPLEMENTATIONS

### 🔴 **Shop Details** - PUBLIC ENDPOINT MISSING

**Issue**: No public route to retrieve shop details

- Sellers can only view their own shop with authentication: `GET /seller/shop`
- Admin can list all shops: `GET /admin/shops`
- **Missing**: Public endpoint to view ANY shop's details (e.g., `GET /public/shop/:shopId`)
- When viewing products, shop info is populated inline, but dedicated shop route doesn't exist

**What's needed**:

- `GET /shop/:shopId` - Public endpoint to get shop profile (name, description, address, contact, rating, products count)

### 🔴 **Orders - BUYER PERSPECTIVE MISSING**

**Issue**: No route for buyers to view their own orders

- `GET /sellerorder` exists for sellers
- **Missing**: `GET /order` or `GET /orders` for buyers to list their orders

**What's needed**:

- `GET /order` - Get authenticated buyer's orders with pagination/filters

### 🔴 **Order Cancellation/Refund Flow INCOMPLETE**

**Issue**: No endpoint to cancel orders or process refunds

- Payment model has refund fields: `refundInfo`, but no route to trigger refunds
- Order status enum includes "cancelled" but no endpoint to cancel

**What's needed**:

- `POST /order/:orderId/cancel` - Cancel order before shipping
- `POST /order/:orderId/refund` - Request/process refund
- Logic to update `paymentStatus` to "refunded" and reverse payment

### 🔴 **Payment Status Tracking INCOMPLETE**

**Issue**: No dedicated endpoint to check payment status

- Payment is created during checkout but no route to get payment details

**What's needed**:

- `GET /payment/:paymentId` - Get payment details and status
- `GET /order/:orderId/payment` - Get payment status for an order

### ⚠️ **Seller Order Management - Ship Endpoint Location**

- `POST /order/ship/:orderId` exists in order routes
- Should this be moved to seller routes? Current location: `POST /order/ship/:orderId`
- Consider: `POST /sellerorder/:orderId/ship` for consistency with other seller actions

---

## 5. COMPLETE ORDER FLOW SUMMARY

### Buyer Perspective

1. ✅ Browse products → `GET /public-product/` and `GET /public-product/:productId`
2. ✅ View seller shop → (Shop info populated in product) - **Missing: Dedicated public shop details endpoint**
3. ✅ Create order → `POST /order/` (from cart)
4. ✅ Checkout → `POST /order/:orderId/checkout`
5. ✅ Pay → `POST /order/payment/process` with card details
6. ⚠️ View orders → **MISSING** - No buyer orders listing
7. ✅ Track shipment → `GET /order/tracking/:trackingNumber`
8. ✅ View invoice → `GET /order/invoice/:orderId`

### Seller Perspective

1. ✅ Create shop → `POST /seller/shop`
2. ✅ View own shop → `GET /seller/shop`
3. ✅ Edit shop → `PUT /seller/shop`
4. ✅ View orders → `GET /sellerorder/`
5. ✅ Accept order → `POST /sellerorder/:orderId/accept`
6. ✅ Reject order → `POST /sellerorder/:orderId/reject`
7. ✅ Ship order → `POST /order/ship/:orderId` (creates TCS shipment)
8. ✅ Complete order → `POST /sellerorder/:orderId/complete`
9. ✅ Delete order → `DELETE /sellerorder/:orderId`
10. ⚠️ View earnings → `GET /sellerorder/:orderId` shows transactions in shop model, but no dedicated earnings endpoint

### Admin Perspective

1. ✅ View pending shops → `GET /admin/shops/pending`
2. ✅ View all shops → `GET /admin/shops`
3. ✅ Verify shop → `POST /admin/shops/:shopId/verify`
4. ✅ Reject shop → `POST /admin/shops/:shopId/reject`
5. ✅ Bulk verify → `POST /admin/shops/bulk-verify`
6. ✅ Delete shop → `DELETE /admin/shops/:shopId`

### Payment & Shipping

1. ✅ Create checkout → `POST /order/:orderId/checkout`
2. ✅ Process payment → `POST /order/payment/process`
3. ✅ Create shipment → `POST /order/ship/:orderId` (calls TCS)
4. ✅ Track shipment → `GET /order/tracking/:trackingNumber`
5. ✅ Auto-distribute payment → Triggered when delivery confirmed (1 min)
6. ⚠️ Handle refunds → **MISSING** - No refund endpoint
7. ⚠️ Cancel orders → **MISSING** - No cancellation endpoint

---

## 6. QUICK REFERENCE - PRIORITY GAPS

| Feature               | Status      | Location                  | Notes                                     |
| --------------------- | ----------- | ------------------------- | ----------------------------------------- |
| Shop Details (Public) | ❌ Missing  | -                         | Need: `GET /shop/:shopId`                 |
| Buyer Orders List     | ❌ Missing  | -                         | Need: `GET /order`                        |
| Order Cancellation    | ❌ Missing  | -                         | Need: `POST /order/:orderId/cancel`       |
| Refund Processing     | ❌ Missing  | -                         | Need: `POST /order/:orderId/refund`       |
| Payment Status        | ⚠️ Partial  | `/order/payment/process`  | Need dedicated: `GET /payment/:paymentId` |
| Shipping (TCS)        | ✅ Complete | `services/tcs.service.js` | Tracks and auto-delivers                  |
| Payment Distribution  | ✅ Complete | `services/tcs.service.js` | 90% to seller, 10% platform fee           |
