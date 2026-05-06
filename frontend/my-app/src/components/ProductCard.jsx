import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(AuthContext);
  const ProductDetails = () => {
    navigate(`/user/product${product._id}`);
  };
  return (
    <Link to={`/user/product/${product._id}`}>
      <div className="bg-white shadow rounded p-4 cursor-pointer hover:shadow-lg text-center transition-shadow">
        <img
          src={product.image || "/Images/m4.png"}
          alt={product.name}
          className="h-40 object-contain w-full"
        />
        <h3 className="text-sm font-medium mt-1 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between my-3">
          <p className="font-semibold text-lg mt-2">${product.price}</p>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-2 bg-blue-500 px-5 py-2 rounded-lg hover:bg-blue-600"
          >
            <FaShoppingCart className="text-white" />
            <span className="text-white">Add to Cart</span>
          </button>
        </div>
        {product.discount && (
          <p className="text-red-500 text-sm">Discount: {product.discount}%</p>
        )}
        <div className="text-yellow-400 mt-2">
          {"★".repeat(Math.round(product.rating || 0))}{" "}
          {product.rating ? `(${product.rating})` : ""}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
