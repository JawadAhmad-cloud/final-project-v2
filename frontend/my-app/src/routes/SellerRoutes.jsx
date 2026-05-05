import { Routes, Route } from "react-router-dom";
import SellerLayout from "../layouts/SellerLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Analytics from "../pages/seller/Analytics";
import Products from "../pages/seller/Products";
import Inventory from "../pages/seller/Inventory";
import Orders from "../pages/seller/Orders";
import Profile from "../pages/seller/Profile";
import CreateShop from "../pages/seller/CreateShop";

const SellerRoutes = () => {
  return (
    <Routes>
      {/* Create Shop - doesn't require SellerLayout (can be done before shop exists) */}
      <Route
        path="create-shop"
        element={
          <ProtectedRoute role="seller">
            <CreateShop />
          </ProtectedRoute>
        }
      />

      {/* Other seller routes within SellerLayout */}
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
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default SellerRoutes;
