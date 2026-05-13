import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-6 py-3 bg-white shadow-sm">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-lg md:text-xl font-bold cursor-pointer whitespace-nowrap"
        >
          Shopio.
        </h1>

        {/* Search Bar - Hidden on small screens */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 mx-6 gap-2">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-l-md outline-none text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-r-md text-sm"
          >
            Search
          </button>
        </form>

        {/* Right Side Icons - Hidden on small screens */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {user ? (
            <>
              {/* Cart */}
              <Link
                to="/user/cart"
                className="flex items-center gap-1 cursor-pointer hover:text-purple-600 transition text-sm"
              >
                <FaShoppingCart />
                <span>Cart</span>
              </Link>

              {/* Favorites */}
              <Link
                to="/user/favorites"
                className="flex items-center gap-1 cursor-pointer hover:text-purple-600 transition text-sm"
              >
                <FaHeart className="text-red-600" />
                <span>Favorites</span>
              </Link>

              {/* Orders */}
              <Link
                to="/user/orders"
                className="flex items-center gap-1 cursor-pointer hover:text-purple-600 transition text-sm"
              >
                📦
                <span>Orders</span>
              </Link>

              {/* Profile */}
              <Link
                to="/user/profile"
                className="flex items-center gap-2 cursor-pointer hover:text-purple-600 transition text-sm"
              >
                <FaUser />
                <span>My Account</span>
              </Link>

              {user?.role === "seller" && (
                <Link
                  to="/seller/analytics"
                  className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                >
                  Dashboard
                </Link>
              )}

              {/* Become Seller Button */}
              {user?.role === "user" && (
                <button
                  onClick={() => navigate("/role")}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                >
                  Be Seller
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-800 transition text-sm"
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
                className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition text-sm"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center cursor-pointer text-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="p-4 border-b">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-md outline-none text-sm"
            />
            <button
              type="submit"
              className="w-full mt-2 px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold"
            >
              Search
            </button>
          </form>

          {/* Mobile Menu Items */}
          <div className="flex flex-col gap-2 p-4">
            {user ? (
              <>
                {/* Cart */}
                <Link
                  to="/user/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded transition text-sm"
                >
                  <FaShoppingCart />
                  <span>Cart</span>
                </Link>

                {/* Favorites */}
                <Link
                  to="/user/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded transition text-sm"
                >
                  <FaHeart className="text-red-600" />
                  <span>Favorites</span>
                </Link>

                {/* Orders */}
                <Link
                  to="/user/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded transition text-sm"
                >
                  <span>📦</span>
                  <span>Orders</span>
                </Link>

                {/* Profile */}
                <Link
                  to="/user/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded transition text-sm"
                >
                  <FaUser />
                  <span>My Account</span>
                </Link>

                {user?.role === "seller" && (
                  <Link
                    to="/seller/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded transition text-sm"
                  >
                    <span>📊</span>
                    <span>Seller Dashboard</span>
                  </Link>
                )}

                {/* Become Seller Button */}
                {user?.role === "user" && (
                  <button
                    onClick={() => {
                      navigate("/role");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                  >
                    Become a Seller
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded transition text-sm"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Sign Up Button */}
                <button
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition text-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserNavbar;
