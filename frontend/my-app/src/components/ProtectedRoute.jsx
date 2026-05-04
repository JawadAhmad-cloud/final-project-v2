import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role mismatch
  if (role && user.data.role !== role) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;