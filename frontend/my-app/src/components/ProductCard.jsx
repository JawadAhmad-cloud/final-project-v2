import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <Link to={`/product/${product._id}`}>
      <div className="bg-white shadow rounded p-4 cursor-pointer hover:shadow-lg text-center transition-shadow">
        <img
          src={product.image || "/Images/m4.png"}
          alt={product.name}
          className="h-40 object-contain w-full"
        />
        <div className="text-yellow-400 mt-2">
          {"★".repeat(Math.round(product.rating || 0))}{" "}
          {product.rating ? `(${product.rating})` : ""}
        </div>
        <h3 className="text-sm font-medium mt-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="font-semibold text-lg mt-2">${product.price}</p>
        {product.discount && (
          <p className="text-red-500 text-sm">Discount: {product.discount}%</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
