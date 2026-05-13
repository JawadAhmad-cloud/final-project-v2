import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SellerNavbar from "../components/SellerNavbar";
import UserNavbar from "../components/UserNavbar";

const SellerLayout = () => {
  const [shopVerified, setShopVerified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkShopVerification();
  }, []);

  const checkShopVerification = async () => {
    try {
      setLoading(true);
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        setError("No authentication token found");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/seller/shop", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const json = await response.json();
        setError(json.message || "Shop not verified");
        setShopVerified(false);
        return;
      }

      const json = await response.json();
      if (json.success) {
        setShopVerified(true);
      } else {
        setError(json.message || "Shop verification failed");
        setShopVerified(false);
      }
    } catch (err) {
      console.error("Error checking shop verification:", err);
      setError(err.message || "Error checking shop status");
      setShopVerified(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Verifying your shop...</p>
        </div>
      </div>
    );
  }

  if (!shopVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          {error && error.includes("Shop not found") ? (
            <>
              <div className="text-gray-600 text-5xl mb-4">🏪</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                No Shop Yet
              </h1>
              <p className="text-gray-600 mb-6">
                You haven't created a shop yet. Create one to start selling.
              </p>
              <button
                onClick={() => {
                  navigate("/seller/create-shop");
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Shop Now
              </button>
            </>
          ) : (
            <>
              <div className="text-orange-600 text-5xl mb-4">⏳</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Shop Pending Verification
              </h1>
              <p className="text-gray-600 mb-6">
                {error ||
                  "Your shop is currently pending admin verification. You will have access to your dashboard once your shop is verified."}
              </p>
              <button
                onClick={() => {
                  sessionStorage.removeItem("user");
                  navigate("/");
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="flex flex-row">
        <SellerNavbar />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SellerLayout;

