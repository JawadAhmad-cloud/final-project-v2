import { createContext, useState, useEffect } from "react";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:5000/api";

  // Admin Login
  const adminLogin = async (formData) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!data.success) {
      throw data;
    }

    const adminUser = data.data;
    setAdmin(adminUser);
    localStorage.setItem("admin", JSON.stringify(adminUser));

    return adminUser;
  };

  // Admin Logout
  const adminLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdmin(null);
      localStorage.removeItem("admin");
    }
  };

  // Check if admin is logged in on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin && storedAdmin !== "undefined") {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  return (
    <AdminContext.Provider
      value={{ admin, adminLogin, adminLogout, setAdmin, loading }}
    >
      {children}
    </AdminContext.Provider>
  );
};
