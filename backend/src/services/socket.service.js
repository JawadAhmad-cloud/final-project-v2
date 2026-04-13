const jwt = require("jsonwebtoken");

// Store seller connections: { sellerId: [socketIds] }
const sellerConnections = {};

/**
 * Initialize Socket.io connection handling
 * @param {Object} io - Socket.io instance
 */
function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected with socket ID:", socket.id);

    // Handle seller authentication and room joining
    socket.on("seller-auth", (token) => {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_secret_key",
        );

        if (decoded.role === "seller") {
          const sellerId = decoded.id;

          // Track seller connection
          if (!sellerConnections[sellerId]) {
            sellerConnections[sellerId] = [];
          }
          sellerConnections[sellerId].push(socket.id);

          // Join seller to a unique room
          socket.join(`seller-${sellerId}`);
          socket.sellerId = sellerId;

          console.log(`Seller ${sellerId} connected with socket ${socket.id}`);
          socket.emit("auth-success", { message: "Authenticated" });
        }
      } catch (error) {
        console.error("Socket authentication error:", error.message);
        socket.emit("auth-error", { message: "Authentication failed" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.sellerId) {
        const sellerId = socket.sellerId;
        if (sellerConnections[sellerId]) {
          sellerConnections[sellerId] = sellerConnections[sellerId].filter(
            (id) => id !== socket.id,
          );
          if (sellerConnections[sellerId].length === 0) {
            delete sellerConnections[sellerId];
          }
        }
        console.log(`Seller ${sellerId} disconnected from socket ${socket.id}`);
      } else {
        console.log("User disconnected from socket:", socket.id);
      }
    });
  });
}

/**
 * Emit new order notification to seller
 * @param {Object} io - Socket.io instance
 * @param {String} sellerId - Seller ID
 * @param {Object} order - Order data
 */
function notifySellerNewOrder(io, sellerId, order) {
  io.to(`seller-${sellerId}`).emit("new-order", {
    orderId: order._id,
    userId: order.user,
    totalAmount: order.totalAmount,
    itemCount: order.items.length,
    status: order.status,
    createdAt: order.createdAt,
    message: "New order received!",
  });

  console.log(`Notified seller ${sellerId} about new order ${order._id}`);
}

/**
 * Emit order status update notification to seller
 * @param {Object} io - Socket.io instance
 * @param {String} sellerId - Seller ID
 * @param {Object} order - Updated order data
 * @param {String} action - Action performed (accepted, rejected, etc.)
 */
function notifySellerOrderUpdate(io, sellerId, order, action) {
  io.to(`seller-${sellerId}`).emit("order-update", {
    orderId: order._id,
    action: action,
    status: order.status,
    sellerStatus: order.sellerStatus,
    message: `Order has been ${action}`,
  });

  console.log(
    `Notified seller ${sellerId} about order update ${order._id}: ${action}`,
  );
}

/**
 * Emit notification to seller for any event
 * @param {Object} io - Socket.io instance
 * @param {String} sellerId - Seller ID
 * @param {String} eventName - Event name
 * @param {Object} data - Event data
 */
function notifySeller(io, sellerId, eventName, data) {
  io.to(`seller-${sellerId}`).emit(eventName, data);
  console.log(`Notification sent to seller ${sellerId}: ${eventName}`);
}

/**
 * Check if seller is connected
 * @param {String} sellerId - Seller ID
 * @returns {Boolean}
 */
function isSellerConnected(sellerId) {
  return sellerConnections[sellerId] && sellerConnections[sellerId].length > 0;
}

module.exports = {
  initializeSocket,
  notifySellerNewOrder,
  notifySellerOrderUpdate,
  notifySeller,
  isSellerConnected,
};
