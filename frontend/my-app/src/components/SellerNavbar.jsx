import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.jsx";

const SellerNavbar = () => {
  const [hasShop, setHasShop] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
  const { newOrderCount, clearNewOrderCount } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    checkIfShopExists();
  }, []);

  const checkIfShopExists = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        setCheckingShop(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/seller/shop", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setHasShop(true);
        }
      }
    } catch (error) {
      console.error("Error checking shop:", error);
    } finally {
      setCheckingShop(false);
    }
  };

  const handleCreateShop = () => {
    navigate("/seller/create-shop");
  };

  const navItems = [
    { label: "Analytics", path: "/seller/analytics" },
    { label: "Inventory", path: "/seller/inventory" },
    { label: "Products", path: "/seller/products" },
    { label: "Orders", path: "/seller/orders" },
    { label: "Profile", path: "/seller/profile" },
  ];

  const sidebarStyle = {
    width: "220px",
    minHeight: "100vh",
    padding: "24px 16px",
    backgroundColor: "#1f2937",
    color: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxSizing: "border-box",
  };

  const titleStyle = {
    margin: 0,
    marginBottom: "24px",
    fontSize: "1.15rem",
    letterSpacing: "0.02em",
  };

  const linkStyle = {
    display: "block",
    padding: "12px 14px",
    borderRadius: "10px",
    color: "#d1d5db",
    textDecoration: "none",
    fontSize: "0.98rem",
    transition: "background-color 0.2s ease, color 0.2s ease",
  };

  const activeLinkStyle = {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  };

  const createShopButtonStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.98rem",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
    marginBottom: "12px",
  };

  return (
    <aside style={sidebarStyle}>
      <h2 style={titleStyle}>Seller Navigation</h2>

      {!hasShop && !checkingShop && (
        <button
          onClick={handleCreateShop}
          style={createShopButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#059669";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#10b981";
          }}
        >
          + Create Shop
        </button>
      )}

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeLinkStyle : {}),
          })}
          onClick={() => {
            if (item.path === "/seller/orders") {
              clearNewOrderCount();
            }
          }}
        >
          <span>{item.label}</span>
          {item.path === "/seller/orders" && newOrderCount > 0 && (
            <span
              style={{
                marginLeft: "8px",
                minWidth: "22px",
                padding: "2px 8px",
                borderRadius: "999px",
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {newOrderCount}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
};

export default SellerNavbar;
