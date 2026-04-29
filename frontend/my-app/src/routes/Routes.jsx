import { Routes, Route, Navigate } from "react-router-dom";

// import Login from "../pages/Login";
// import Register from "../pages/Register";
import ChooseRole from "../pages/auth/ChooseRole";
import UserDashboard from "../pages/user/UserDashboard";
import SellerDashboard from "../pages/seller/SellerDashboard";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"
import ProtectedRoute from "../components/ProtectedRoute";
import AuthPage from "../pages/auth/AuthPage";
const AppRoutes = () => {
    const {user}=useContext(AuthContext)
  return (
    <Routes>
  {/* default Routes; */}

 <Route
    path="/"
    element={
      user ? (
        user.role === "user"
          ? <Navigate to="/user/dashboard" />
          : <Navigate to="/seller/dashboard" />
      ) : (
        <Navigate to="/auth" />
      )
    }
  />


      {/* Public routes */}
       <Route path="/auth" element={<AuthPage/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    <Route path="/role" element={<ChooseRole />} />

      {/* User dashboard */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserDashboard/>
          </ProtectedRoute>
        }
      />

      {/* Seller dashboard */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute role="seller">
            <SellerDashboard/>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;