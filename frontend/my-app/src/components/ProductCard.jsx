import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
 import toast from "react-hot-toast"; // if using toast
const ProductCard = ({ product }) => {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigate=useNavigate()
  const ProductDetails=()=>{
      navigate(`/user/product${product._id}`)
  }
const addToFavourite = async () => {
  if (loading) return;

  try {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/favourite/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        productId: product._id,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }
    setIsFav(true);
    toast.success("Added to favorites ❤️"); 
  } catch (err) {
    console.error(err);

    toast.error(err.message || "Failed to update favorite");
  } finally {
    setLoading(false);
  }
};
  return (
    <Link to={`/product/${product._id}`}>
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
  onClick={addToFavourite}
  disabled={loading}
  className="flex items-center gap-2 bg-pink-500 px-5 py-2 rounded-lg"
>
  {isFav ? (
    <FaHeart className="text-red-600" />
  ) : (
    <FaRegHeart className="text-white" />
  )}
  <span className="text-white">
    {isFav ? "Favorited" : "Add to Favorites"}
  </span>
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
