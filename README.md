# E-Commerce Platform with Multi-Seller Support

A comprehensive, production-ready e-commerce platform enabling multiple sellers to manage their own shops while customers browse products, place orders, and leave reviews.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Frontend Components](#-frontend-components)
- [Authentication & Security](#-authentication--security)
- [Contributing](#-contributing)

---

## ✨ Features

### User Features

- **Authentication**: Registration, login, email verification with OTP
- **Profile Management**: Update personal information, manage addresses
- **Product Browsing**: Search, filter, and view product details
- **Shopping**: Add to cart, place orders, track orders in real-time
- **Favorites**: Wishlist management for products
- **Reviews**: Rate and review purchased products
- **Order History**: View past purchases and order details

### Seller Features

- **Shop Management**: Create and manage multi-product shops
- **Inventory Management**: Add, update, delete products with stock tracking
- **Order Management**: Accept/reject orders, update delivery status
- **Product Images**: Upload multiple images (main, side views)
- **Sales Analytics**: Track revenue, earnings, and performance
- **Transaction History**: Monitor all financial transactions

### Payment Features

- **Secure Checkout**: Stripe-integrated payment processing
- **Multiple Payment Methods**: Credit cards, bank transfers, digital wallets
- **Payment Status Tracking**: Real-time payment confirmation
- **Refund Processing**: Handle refunds and chargebacks
- **Commission Management**: Automatic platform fee deduction

### Admin Features

- **User Management**: Monitor users, sellers, and their activities
- **Order Management**: View and manage all platform orders
- **Payment Tracking**: Monitor transactions and settlements
- **Platform Analytics**: Revenue, user, and sales metrics

---

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Payment Gateway**: Stripe API
- **Image Storage**: ImageKit
- **Validation**: Joi, express-validator
- **HTTP Client**: Axios

### Frontend

- **Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: Context API / Redux
- **HTTP Client**: Axios
- **Styling**: CSS3 / Tailwind CSS
- **Package Manager**: npm / yarn

### DevOps & Tools

- **Version Control**: Git
- **API Documentation**: RESTful API
- **Database**: MongoDB Cloud

---

## 📁 Project Structure

```
final project v2/
├── backend/
│   ├── src/
│   │   ├── app.js                          # Express app setup
│   │   ├── controller/                     # Business logic
│   │   │   ├── user.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── shop.controller.js
│   │   │   ├── seller.controller.js
│   │   │   ├── favourite.controller.js
│   │   │   ├── admin-analytics.controller.js
│   │   │   ├── adminsettings.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── db/
│   │   │   └── db.js                       # Database connection
│   │   ├── middleware/
│   │   │   └── auth.middleware.js          # Authentication middleware
│   │   ├── model/                          # Database schemas
│   │   │   ├── user.model.js
│   │   │   ├── product.model.js
│   │   │   ├── order.model.js
│   │   │   ├── payment.model.js
│   │   │   ├── review.model.js
│   │   │   ├── shop.model.js
│   │   │   └── favourite.model.js
│   │   ├── routes/                         # API endpoints
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── shop.routes.js
│   │   │   ├── seller.routes.js
│   │   │   ├── favourite.routes.js
│   │   │   ├── public-product.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── adminmanagement.routes.js
│   │   │   ├── adminsettings.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── admin-analytics.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   └── sellerorder.routes.js
│   │   └── services/                       # Business logic & validation
│   │       ├── auth.validation.js
│   │       ├── user.validation.js
│   │       ├── product.validation.js
│   │       ├── order.validation.js
│   │       ├── payment.service.js
│   │       ├── email.service.js
│   │       ├── imagekit.product.service.js
│   │       ├── invoice.service.js
│   │       ├── tcs.service.js
│   │       ├── socket.service.js
│   │       └── tokenBlacklist.js
│   ├── package.json                        # Backend dependencies
│   └── server.js                           # Entry point
│
├── frontend/
│   └── my-app/
│       ├── src/
│       │   ├── App.jsx                     # Main app component
│       │   ├── App.css                     # Global styles
│       │   ├── main.jsx                    # React entry point
│       │   ├── index.css                   # Global styles
│       │   ├── components/
│       │   │   ├── UserNavbar.jsx          # User navigation
│       │   │   ├── SellerNavbar.jsx        # Seller navigation
│       │   │   ├── ProductCard.jsx         # Product display
│       │   │   ├── ProtectedRoute.jsx      # Route protection
│       │   │   └── banner/                 # Banner components
│       │   ├── context/                    # Context providers
│       │   └── assets/                     # Images, fonts
│       ├── package.json                    # Frontend dependencies
│       ├── vite.config.js                  # Vite config
│       ├── index.html                      # HTML template
│       └── eslint.config.js                # Linting config
│
├── THESIS.md                               # Complete thesis documentation
├── README.md                               # This file
└── todo                                    # Todo/notes file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or cloud)
- Stripe account for payments
- ImageKit account for image hosting

### Backend Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd final\ project\ v2/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file** (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SENDER_EMAIL=your_email@gmail.com

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Image Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=public_key
IMAGEKIT_PRIVATE_KEY=private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_account

# Frontend URL
FRONTEND_URL=http://localhost:3000

# API Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

4. **Start the server**

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**

```bash
cd frontend/my-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file** (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

4. **Start development server**

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 📊 Database Schema

### Collections Overview

| Collection    | Purpose         | Key Fields                                      |
| ------------- | --------------- | ----------------------------------------------- |
| **User**      | User accounts   | username, email, password, role, addresses      |
| **Product**   | Product catalog | name, seller, price, stock, images, rating      |
| **Shop**      | Seller shops    | seller, shopname, verification status, earnings |
| **Order**     | Customer orders | user, seller, items, status, totalAmount        |
| **Payment**   | Payment records | orderId, amount, status, transactionId          |
| **Review**    | Product reviews | product, user, rating, comment, verified        |
| **Favourite** | User wishlists  | user, products                                  |

### Key Relationships

```
User (1) ──── (M) Order
User (1) ──── (1) Favourite
User (1) ──── (1) Shop (if seller)
Shop (1) ──── (M) Product
Shop (1) ──── (M) Order (received)
Product (1) ──── (M) Order (items)
Product (1) ──── (M) Review
Order (1) ──── (1) Payment
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/verify-email    # Verify email with OTP
```

### Users

```
GET    /api/users/:id            # Get user profile
PUT    /api/users/:id            # Update user profile
GET    /api/users/:id/orders     # Get user orders
GET    /api/users/:id/addresses  # Get user addresses
POST   /api/users/:id/addresses  # Add new address
```

### Products

```
GET    /api/products             # List all products (paginated)
GET    /api/products/:id         # Get product details
POST   /api/products             # Create product (seller)
PUT    /api/products/:id         # Update product (seller)
DELETE /api/products/:id         # Delete product (seller)
GET    /api/products/search      # Search products
```

### Orders

```
POST   /api/orders               # Create new order
GET    /api/orders               # Get user orders
GET    /api/orders/:id           # Get order details
PUT    /api/orders/:id/status    # Update order status
PUT    /api/orders/:id/cancel    # Cancel order
```

### Payments

```
POST   /api/payments/create-checkout-session  # Create Stripe session
POST   /api/payments/webhook     # Stripe webhook
GET    /api/payments/:orderId    # Get payment details
POST   /api/payments/:paymentId/refund       # Refund payment
```

### Reviews

```
POST   /api/reviews              # Create review
GET    /api/reviews/product/:id  # Get product reviews
PUT    /api/reviews/:id          # Update review
DELETE /api/reviews/:id          # Delete review
```

### Shops

```
POST   /api/shops                # Create shop
GET    /api/shops                # List shops
GET    /api/shops/:id            # Get shop details
PUT    /api/shops/:id            # Update shop
GET    /api/shops/:id/products   # Get shop products
GET    /api/shops/:id/orders     # Get shop orders
```

### Favorites

```
POST   /api/favorites            # Add to favorites
GET    /api/favorites            # Get user favorites
DELETE /api/favorites/:productId # Remove from favorites
```

---

## 🎨 Frontend Components

### Core Components

- **UserNavbar**: Navigation bar for regular users
- **SellerNavbar**: Navigation bar for seller dashboard
- **ProductCard**: Reusable product card component
- **ProtectedRoute**: Route wrapper for authenticated-only pages

### Page Components

- **Home**: Landing page with featured products
- **ProductCatalog**: Browse all products
- **ProductDetail**: View single product details
- **SearchResults**: Search results page
- **ShoppingCart**: Cart management
- **Checkout**: Order placement
- **OrderTracking**: Track order status
- **UserProfile**: User account settings
- **SellerDashboard**: Seller management panel
- **ReviewPage**: Product reviews

---

## 🔐 Authentication & Security

### Authentication Flow

1. User registers → Email verification with OTP
2. User logs in → JWT token issued
3. Token stored in localStorage
4. All protected endpoints require valid JWT
5. Token automatically included in API requests
6. Token expires after 7 days (configurable)

### Security Measures

- **Password**: Hashed with bcryptjs (salt rounds: 10)
- **JWT**: Signed with secret key, time-limited
- **Routes**: Protected with authentication middleware
- **Input Validation**: All inputs validated before processing
- **CORS**: Configured for frontend domain
- **HTTPS**: Recommended for production
- **Rate Limiting**: Prevent brute force attacks
- **Sensitive Data**: Passwords and OTPs not returned in responses

### Role-Based Access Control

```
User Roles:
- user: Regular customer access
- seller: Shop and product management
- admin: Full platform access
```

---

## 💳 Payment Integration

### Stripe Flow

1. Customer adds items and proceeds to checkout
2. Backend creates Stripe checkout session
3. Frontend redirects to Stripe payment form
4. Customer enters payment details (handled by Stripe)
5. Stripe returns payment status
6. Webhook confirms payment
7. Order created and confirmed

### Payment Status

- **pending**: Waiting for payment
- **paid**: Payment successful
- **failed**: Payment declined
- **refunded**: Refund processed

---

## 📈 Key Business Logic

### Inventory Management

- totalStock: All available units
- availableStock: Open for purchase = totalStock - reservedStock
- reservedStock: Units in pending/active orders
- Automatic updates on order status changes

### Order Status Workflow

```
pending → accepted → shipped → delivered
         ↓
        rejected
         ↓
      cancelled
```

### Payment Distribution

1. Customer pays → Stripe receives payment
2. Platform deducts commission fee
3. Remaining amount credited to seller
4. Seller can withdraw earnings

### Review System

- Only verified purchases can review
- Ratings aggregated for product rating
- Reviews displayed with helpful vote count
- Automatic rating calculation

---

## 🔄 Development Workflow

### Making Changes

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -m "Add feature description"`
5. Push: `git push origin feature/feature-name`
6. Create Pull Request

### Best Practices

- Keep commits atomic and descriptive
- Write meaningful commit messages
- Test before pushing
- Update documentation
- Follow existing code style

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**

- Check MongoDB URI in `.env`
- Ensure MongoDB cluster is running
- Verify IP whitelist on MongoDB Atlas

**Stripe Payment Fails**

- Verify API keys in `.env`
- Check webhook configuration
- Use Stripe test cards (4242 4242 4242 4242)

**JWT Token Invalid**

- Clear localStorage and log in again
- Check JWT secret matches backend
- Verify token hasn't expired

**CORS Errors**

- Add frontend URL to CORS whitelist in backend
- Check API_URL in frontend `.env`

---

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes with clear messages
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact & Support

For questions or support, contact the development team.

---

**Last Updated**: May 2026  
**Version**: 1.0  
**Status**: Production Ready
