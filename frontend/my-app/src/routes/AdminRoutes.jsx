import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import ShopManagement from "../pages/admin/ShopManagement";
import AdminManagement from "../pages/admin/AdminManagement";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";

const AdminRoutes = ({ onLogout }) => {
  const { admin } = useContext(AdminContext);

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Only admins can access admin routes (not sellers)
  if (admin.role !== "admin") {
    return (
      <Navigate to={admin.role === "seller" ? "/seller/orders" : "/"} replace />
    );
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="shops" element={<ShopManagement />} />
        <Route path="management" element={<AdminManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
