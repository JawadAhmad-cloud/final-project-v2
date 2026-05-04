import { Routes, Route} from "react-router-dom";

import AuthPage from "../pages/auth/AuthPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ChooseRole from "../pages/auth/ChooseRole";
import UserRoutes from "./UserRoutes";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import CompleteProfile from "../pages/auth/CompleteProfile";
// import SellerRoutes from "./SellerRoutes";

const AppRoutes = () => {
  const {user} = useContext(AuthContext)
  return (
     <Routes>
      {/* Root route FIX */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.role === "user"
                  ? "/user/dashboard"
                  : "/seller/dashboard"
                : "/auth"
            }
            replace
          />
        }
      />
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role" element={<ChooseRole />} />
<Route path="/profile-complete" element={<CompleteProfile/>} />
      {/* Protected Feature Routes */}
      <Route path="/user/*" element={<UserRoutes />} />
      {/* <Route path="/seller/*" element={<SellerRoutes />} /> */}
    </Routes>
  );
};

export default AppRoutes;