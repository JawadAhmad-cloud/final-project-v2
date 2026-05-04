import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";

const UserNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      
      {/* Logo */}
      <h1 
        onClick={() => navigate("/user/dashboard")}
        className="text-xl font-bold cursor-pointer"
      >
        Shopio.
      </h1>

      {/* Search Bar */}
      <div className="flex items-center w-1/3 gap-2" >
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full px-4 py-2 border rounded-l-md outline-none"
        />
        <button className="px-4 py-2 bg-purple-600 text-white rounded-r-md">
          Search
        </button>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        
        {/* Cart */}
        <Link to="/user/cart" className="flex items-center gap-1 cursor-pointer">
          <FaShoppingCart />
          <span>Cart</span>
        </Link>

        {/* Favorites */}
        <Link to="/user/favorites" className="flex items-center gap-1 cursor-pointer">
          <FaHeart className="text-red-600 text-2xl" />
          <span>Favorites</span>
        </Link>

        {/* Profile */}
        <Link to="/user/profile" className="flex items-center gap-2 cursor-pointer">
          <FaUser />
          <span>My Account</span>
        </Link>

      </div>
    </nav>
  );
};

export default UserNavbar;