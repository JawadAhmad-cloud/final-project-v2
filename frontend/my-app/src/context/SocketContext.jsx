import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

export const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const authenticateSeller = (socketInstance = socket) => {
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token;

    if (!socketInstance) return;

    if (socketInstance.connected && token && user?.role === "seller") {
      console.log("📡 Emitting seller-auth...");
      socketInstance.emit("seller-auth", token);
    } else {
      console.warn("Seller auth skipped:", {
        connected: socketInstance.connected,
        hasToken: !!token,
        role: user?.role,
      });
    }
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token;

    if (!token || user?.role !== "seller") {
      console.warn(
        "Socket connection skipped: user is not authenticated as seller",
      );
      return;
    }

    // Connect to the backend Socket.IO server
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    setSocket(newSocket);

    // Handle connection
    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      setIsConnected(true);
      authenticateSeller(newSocket);
    });

    // Handle disconnection
    newSocket.on("disconnect", () => {
      console.log("⚠️ Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    // Listen for authentication success/error
    newSocket.on("auth-success", (data) => {
      console.log("✅ Seller authenticated:", data.message);
      // Fetch initial pending order count after auth
      fetchInitialOrderCount();
    });

    newSocket.on("auth-error", (data) => {
      console.error("❌ Authentication failed:", data.message, data);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Separate effect to handle "new-order" listener to avoid closure issues
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      console.log("📦 New order received:", data);
      setNewOrderCount((prevCount) => {
        const newCount = prevCount + 1;
        console.log(`✅ Badge count updated: ${prevCount} -> ${newCount}`);
        return newCount;
      });
      toast.success(
        `New order received! Order ID: ${data.orderId}, Total: ৳${data.totalAmount}`,
      );
    };

    const handleOrderUpdate = (data) => {
      console.log("📝 Order updated:", data);
      toast.info(
        `Order ${data.orderId} has been ${data.action}. Status: ${data.status}`,
      );
    };

    socket.on("new-order", handleNewOrder);
    socket.on("order-update", handleOrderUpdate);

    // Cleanup old listeners when socket changes
    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-update", handleOrderUpdate);
    };
  }, [socket]);

  // Function to fetch initial pending order count
  const fetchInitialOrderCount = async () => {
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token;

    if (!token) return;

    try {
      console.log("Fetching initial order count...");
      const response = await fetch(
        "http://localhost:5000/api/seller/orders?page=1&limit=1&status=pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const pendingCount = data.data.summary?.pendingOrders || 0;
          console.log("Initial order count fetched:", pendingCount);
          setNewOrderCount(pendingCount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial order count:", error);
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
