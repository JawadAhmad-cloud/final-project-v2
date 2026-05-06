import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      {/* Logo */}
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-bold cursor-pointer"
      >
        Shopio.
      </h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center w-1/3 gap-2">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-l-md outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-md"
        >
          Search
        </button>
      </form>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Cart */}
            <Link
              to="/user/cart"
              className="flex items-center gap-1 cursor-pointer"
            >
              <FaShoppingCart />
              <span>Cart</span>
            </Link>

            {/* Favorites */}
            <Link
              to="/user/favorites"
              className="flex items-center gap-1 cursor-pointer"
            >
              <FaHeart className="text-red-600 text-2xl" />
              <span>Favorites</span>
            </Link>

            {/* Orders */}
            <Link
              to="/user/orders"
              className="flex items-center gap-1 cursor-pointer"
            >
              📦
              <span>Orders</span>
            </Link>

            {/* Profile */}
            <Link
              to="/user/profile"
              className="flex items-center gap-2 cursor-pointer"
            >
              <FaUser />
              <span>My Account</span>
            </Link>

            {user?.role === "seller" && (
              <Link
                to="/seller/analytics"
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Seller Dashboard
              </Link>
            )}

            {/* Become Seller Button */}
            {user?.role === "user" && (
              <button
                onClick={() => navigate("/role")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Become a Seller
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-800"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            {/* Sign Up Button */}
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default UserNavbar;
