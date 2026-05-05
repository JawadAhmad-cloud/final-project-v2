import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Cart from "../pages/user/Cart";
import Favorites from "../pages/user/Favorites";
import UserProfile from "../pages/user/UserProfile";
import ProtectedRoute from "../components/ProtectedRoute";
import ProductDetailspage from "../pages/user/ProductDetailspage";

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
            {/* producut details page route */}
            <Route path="product/:id" element={<ProductDetailspage/>}/>
        {/* profile page inside user scope */}
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
