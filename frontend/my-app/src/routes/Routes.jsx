import { Routes, Route } from "react-router-dom";

import AuthPage from "../pages/auth/AuthPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ChooseRole from "../pages/auth/ChooseRole";
import UserRoutes from "./UserRoutes";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AdminContext } from "../context/AdminContext";
import CompleteProfile from "../pages/auth/CompleteProfile";
import Home from "../pages/Home";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminRoutes from "./AdminRoutes";
import SellerRoutes from "./SellerRoutes";

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const { admin, adminLogout } = useContext(AdminContext);

  const handleAdminLogout = async () => {
    await adminLogout();
  };

  return (
    <Routes>
      {/* Root route - Home page */}
      <Route path="/" element={<Home />} />
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role" element={<ChooseRole />} />
      <Route path="/profile-complete" element={<CompleteProfile />} />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          admin ? (
            <AdminRoutes onLogout={handleAdminLogout} />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      {/* Protected Feature Routes */}
      <Route path="/user/*" element={<UserRoutes />} />
      <Route path="/seller/*" element={<SellerRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
