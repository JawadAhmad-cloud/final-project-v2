# Khyber Store - System Diagrams

## 1. Use Case Diagram

The use case diagram shows all interactions between three main actors and the system:

### User Actor

- Browse Products
- Search Products
- View Product Details
- Add to Cart
- Checkout
- Place Order
- Track Order
- View Order History
- Leave Review
- Add to Favorites
- Manage Profile
- Email Verification

### Seller Actor

- Create Shop
- Manage Products
- Upload Product Images
- View Orders
- Accept/Reject Orders
- Update Order Status
- View Analytics
- Manage Inventory
- Update Shop Profile
- View Sales Reports

### Admin Actor

- Manage Shops (verify, reject, view)
- Manage Users
- Manage Sellers
- Manage Admins (add/remove)
- View Platform Analytics
- Manage System Settings
- View Revenue Reports
- Monitor Orders

---

## 2. Entity-Relationship Diagram

### Tables and Relationships

#### USERS Table

- `_id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password`
- `phone`
- `avatar`
- `role` (user/seller/admin)
- `currency` (PKR)
- `address` (Object)
- `isEmailVerified` (Boolean)
- `verificationtoken`
- `verificationtokenexpiry`
- `createdAt`, `updatedAt`

**Relationships:**

- Creates SHOPS (1:Many)
- Places ORDERS (1:Many)
- Writes REVIEWS (1:Many)
- Adds FAVOURITES (1:Many)
- Makes PAYMENTS (1:Many)

---

#### SHOPS Table

- `_id` (Primary Key)
- `userId` (Foreign Key)
- `name` (Unique)
- `description`
- `logo`, `banner`
- `address`, `city`
- `phone`, `email`
- `isverified` (pending/verified/rejected)
- `createdAt`, `updatedAt`

**Relationships:**

- Belongs to USER (Many:1)
- Contains PRODUCTS (1:Many)
- Receives ORDERS (1:Many)

---

#### PRODUCTS Table

- `_id` (Primary Key)
- `shopId` (Foreign Key)
- `name`
- `description`
- `category`
- `price` (in PKR)
- `currency` (PKR)
- `stock` (Number)
- `images` (Array)
- `rating` (Number)
- `inStock` (Boolean)
- `createdAt`

**Relationships:**

- Belongs to SHOP (Many:1)
- Included in ORDERS (Many:Many via Order Items)
- Has REVIEWS (1:Many)
- Has FAVOURITES (1:Many)

---

#### ORDERS Table

- `_id` (Primary Key)
- `userId` (Foreign Key)
- `sellerId` (Foreign Key)
- `items` (Array of product objects)
- `shippingAddress` (Object)
- `totalPrice` (Number)
- `totalAmount` (Number)
- `status` (pending/accepted/rejected/completed/cancelled)
- `paymentStatus` (pending/completed/failed)
- `createdAt`

**Relationships:**

- Belongs to USER (Many:1)
- Belongs to SHOP/Seller (Many:1)
- Has PAYMENT (1:1)
- Has REVIEWS (1:Many)

---

#### PAYMENTS Table

- `_id` (Primary Key)
- `orderId` (Foreign Key)
- `userId` (Foreign Key)
- `method` (Stripe, COD, etc.)
- `status` (pending/completed/failed)
- `amount` (Number)
- `currency` (PKR)
- `metadata` (Object)
- `createdAt`

**Relationships:**

- Belongs to ORDER (Many:1)
- Belongs to USER (Many:1)

---

#### REVIEWS Table

- `_id` (Primary Key)
- `productId` (Foreign Key)
- `userId` (Foreign Key)
- `rating` (1-5)
- `comment` (String)
- `createdAt`

**Relationships:**

- Belongs to PRODUCT (Many:1)
- Belongs to USER (Many:1)

---

#### FAVOURITES Table

- `_id` (Primary Key)
- `userId` (Foreign Key)
- `productId` (Foreign Key)
- `createdAt`

**Relationships:**

- Belongs to USER (Many:1)
- Belongs to PRODUCT (Many:1)

---

## 3. Database Design Diagram

Shows the complete structure with all fields and relationships in a single view.

### Key Features:

- **Primary Keys (PK)**: Unique identifiers for each table
- **Foreign Keys (FK)**: Links between tables
- **Data Types**: String, Number, Date, Boolean, Object, Array
- **Relationships**: Shows how tables connect (1:1, 1:Many, Many:Many)

### Design Principles:

- NoSQL MongoDB structure (JSON-like documents)
- Denormalization where needed for performance
- Embedded objects for address, item details
- Timestamp tracking (createdAt, updatedAt)
- Email verification tokens for security
- Role-based access control (user/seller/admin)

---

## Architecture Flow

```
USER FLOWS:
1. User Registration → Email Verification → Profile Complete
2. User Browses → Search → View Details → Add to Cart → Checkout → Order
3. User Reviews → Ratings
4. User Favorites → Saved Products

SELLER FLOWS:
1. Seller Registration → Create Shop → Wait for Admin Verification
2. Shop Verified → Manage Products → Upload Images → List Products
3. Receive Orders → Accept/Reject → Update Status → Complete

ADMIN FLOWS:
1. Admin Login → Access Dashboard
2. Review Pending Shops → Verify or Reject
3. Manage Users/Sellers → Add/Remove Admins
4. View Platform Analytics → Revenue Reports → Monitor System
```

---

## Security & Validation

- **Authentication**: JWT tokens (stored in sessionStorage)
- **Authorization**: Role-based middleware checks
- **Email Verification**: OTP-based verification for new users
- **Password Security**: Hashed passwords in database
- **Order Validation**: Items, prices, and inventory checks before creation
- **Payment**: Stripe integration with metadata tracking

---

_Last Updated: May 12, 2026_
