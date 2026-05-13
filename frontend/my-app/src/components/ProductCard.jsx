import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(AuthContext);
  const [added, setAdded] = useState(false);
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const discountedPrice = discount
    ? (price - price * (discount / 100)).toFixed(2)
    : price.toFixed(2);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const imageUrl =
    product.images?.main ||
    product.image ||
    product.images?.side1 ||
    product.images?.side2 ||
    "/Images/m4.png";

  return (
    <div className="product-card">
      <Link to={`/user/product/${product._id}`} className="product-card-media">
        {discount > 0 && (
          <span className="product-card-badge">-{discount}%</span>
        )}
        <img src={imageUrl} alt={product.name} className="product-card-image" />
      </Link>

      <div className="product-card-body">
        <div>
          <h3 className="product-card-title line-clamp-2">{product.name}</h3>
          {product.category && (
            <p className="product-card-meta text-sm mt-1">{product.category}</p>
          )}
        </div>

        <div className="product-card-price-row">
          <div>
            <p className="product-card-price">₨{discountedPrice}</p>
            {discount > 0 && (
              <p className="product-card-original-price mt-1">
                ₨{price.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="btn-primary product-card-button flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="text-white" />
            {added ? "Added" : "Add to Cart"}
          </button>
        </div>

        <div className="product-card-footer">
          <span className="product-card-rating">
            {"★".repeat(Math.round(product.rating || 0))}{" "}
            {product.rating ? `(${product.rating})` : "No rating"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
