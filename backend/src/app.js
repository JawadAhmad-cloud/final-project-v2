const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import routes
const authRoute = require("./routes/auth.routes");
const userRoute = require("./routes/user.routes");
const sellerRoute = require("./routes/seller.routes");
const adminRoute = require("./routes/admin.routes");
const adminManagementRoute = require("./routes/adminmanagement.routes");
const cartRoute = require("./routes/cart.routes");
const favouriteRoute = require("./routes/favourite.routes");
const productRoute = require("./routes/product.routes");
const inventoryRoute = require("./routes/inventory.routes");
const sellerOrderRoute = require("./routes/sellerorder.routes");
const analyticsRoute = require("./routes/analytics.routes");
const reviewRoute = require("./routes/review.routes");

// Import middlewares
const {
  authMiddleware,
  roleMiddleware,
} = require("./middleware/auth.middleware");

const app = express();

// Global middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());

// Auth routes (no authentication required)
app.use("/api/auth", authRoute);

// User routes
app.use("/api/user", authMiddleware, userRoute);

// Seller routes
app.use("/api/seller", authMiddleware, roleMiddleware("seller"), sellerRoute);

// Product routes (seller dashboard)
app.use(
  "/api/seller/products",
  authMiddleware,
  roleMiddleware("seller"),
  productRoute,
);

// Inventory routes (seller dashboard)
app.use(
  "/api/seller/inventory",
  authMiddleware,
  roleMiddleware("seller"),
  inventoryRoute,
);

// Seller order routes (seller dashboard)
app.use(
  "/api/seller/orders",
  authMiddleware,
  roleMiddleware("seller"),
  sellerOrderRoute,
);

// Analytics routes (seller dashboard)
app.use(
  "/api/seller/analytics",
  authMiddleware,
  roleMiddleware("seller"),
  analyticsRoute,
);

// Review routes (mixed auth - POST requires user, GET is public)
app.use("/api/reviews", reviewRoute);

// Cart routes
app.use("/api/cart", authMiddleware, cartRoute);

// Favourite routes
app.use("/api/favourite", authMiddleware, favouriteRoute);

// Admin routes (admin only)
app.use("/api/admin", authMiddleware, roleMiddleware("admin"), adminRoute);

// Admin management routes (admin only)
app.use(
  "/api/admin/management",
  authMiddleware,
  roleMiddleware("admin"),
  adminManagementRoute,
);

module.exports = app;
