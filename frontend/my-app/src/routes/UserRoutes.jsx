import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import UserDashboard from "../pages/user/UserDashboard";
import Cart from "../pages/user/Cart";
import Favorites from "../pages/user/Favorites";
import UserProfile from "../pages/user/UserProfile";
import ProtectedRoute from "../components/ProtectedRoute";

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="cart" element={<Cart />} />
        <Route path="favorites" element={<Favorites />} />

        {/* profile page inside user scope */}
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;