import io from "socket.io-client";

let socket = null;

/**
 * Connect socket for seller notifications
 * @param {string} serverUrl - Server URL
 * @param {string} token - JWT token for authentication
 * @param {function} onNewOrder - Callback for new orders
 * @returns {object} socket instance
 */
export const connectSellerSocket = (serverUrl, token, onNewOrder) => {
  if (socket && socket.connected) {
    console.log("Socket already connected");
    return socket;
  }

  socket = io(serverUrl, {
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Connected to socket server");
    // Authenticate seller
    socket.emit("seller-auth", token);
  });

  socket.on("auth-success", (data) => {
    console.log("✅ Seller authenticated:", data);
  });

  socket.on("auth-error", (data) => {
    console.error("❌ Socket authentication failed:", data);
    if (socket) {
      socket.disconnect();
    }
  });

  socket.on("new-order", (order) => {
    console.log("📦 New order received:", order);
    if (onNewOrder) {
      onNewOrder(order);
    }
  });

  socket.on("order-update", (data) => {
    console.log("📝 Order update:", data);
  });

  socket.on("disconnect", () => {
    console.log("⚠️ Disconnected from socket server");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
  });

  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("✅ Socket disconnected");
  }
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};
