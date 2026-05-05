import React from "react";
import { NavLink } from "react-router-dom";

const SellerNavbar = () => {
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

  return (
    <aside style={sidebarStyle}>
      <h2 style={titleStyle}>Seller Navigation</h2>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeLinkStyle : {}),
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default SellerNavbar;
