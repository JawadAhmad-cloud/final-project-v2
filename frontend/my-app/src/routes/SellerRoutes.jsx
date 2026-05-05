import { Routes, Route } from "react-router-dom";
import SellerLayout from "../layouts/SellerLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Analytics from "../pages/seller/Analytics";
import Products from "../pages/seller/Products";
import Inventory from "../pages/seller/Inventory";
import Orders from "../pages/seller/Orders";
import Profile from "../pages/seller/Profile";

const SellerRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute role="seller">
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="analytics" element={<Analytics />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders/>} />
        <Route path="profile" element={<Profile/>} />
      </Route>
    </Routes>
  );
};

export default SellerRoutes;
