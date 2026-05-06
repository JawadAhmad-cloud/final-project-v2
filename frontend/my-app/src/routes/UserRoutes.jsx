import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Cart from "../pages/user/Cart";
import Favorites from "../pages/user/Favorites";
import UserProfile from "../pages/user/UserProfile";
import ProtectedRoute from "../components/ProtectedRoute";
import ProductDetailspage from "../pages/user/ProductDetailspage";
import Orders from "../pages/user/Orders";
import Checkout from "../pages/user/Checkout";

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute role={["user", "seller"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="cart" element={<Cart />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="product/:id" element={<ProductDetailspage />} />
        <Route path="orders" element={<Orders />} />
        <Route path="checkout/:orderId?" element={<Checkout />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
