import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

export const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    // Connect to the backend Socket.IO server
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    // Handle connection
    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    // Handle disconnection
    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    // Listen for authentication success/error
    newSocket.on("auth-success", (data) => {
      console.log("Seller authenticated:", data.message);
    });

    newSocket.on("auth-error", (data) => {
      console.error("Authentication failed:", data.message);
    });

    // Listen for new order notifications
    newSocket.on("new-order", (data) => {
      console.log("New order received:", data);
      setNewOrderCount((count) => count + 1);
      toast.success(
        `New order received! Order ID: ${data.orderId}, Total: $${data.totalAmount}`,
      );
    });

    // Listen for order update notifications
    newSocket.on("order-update", (data) => {
      console.log("Order updated:", data);
      toast.info(
        `Order ${data.orderId} has been ${data.action}. Status: ${data.status}`,
      );
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Function to get JWT token from cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") {
        // Assuming the cookie name is 'token'
        return value;
      }
    }
    return null;
  };

  // Function to fetch initial pending order count
  const fetchInitialOrderCount = async () => {
    const token = getTokenFromCookies();
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/seller/orders?limit=1",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.summary) {
          setNewOrderCount(data.data.summary.pendingOrders);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial order count:", error);
    }
  };

  // Function to authenticate as a seller
  const authenticateSeller = () => {
    const token = getTokenFromCookies();
    if (socket && isConnected && token) {
      socket.emit("seller-auth", token);
      // Fetch initial order count after authentication
      fetchInitialOrderCount();
    }
  };

  const clearNewOrderCount = () => setNewOrderCount(0);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        newOrderCount,
        clearNewOrderCount,
        authenticateSeller,
        fetchInitialOrderCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
