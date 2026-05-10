import React, { useContext, useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function ProductDetailspage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [reviewMessage, setReviewMessage] = useState("");
  const { addToCart, user } = useContext(AuthContext);

  const carthandler = () => {
    if (!user) {
      setMessage("Please login to add items to cart");
      setTimeout(() => setMessage(""), 3000);
      navigate("/login");
      return;
    }

    if (!product) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image:
        product.images?.main ||
        product.image ||
        product.images?.side1 ||
        product.images?.side2 ||
        "/Images/m4.png",
      seller: product.seller?.shopname,
    });
    setMessage("Item added to cart!");
    setTimeout(() => setMessage(""), 2000);
  };

  const orderHandler = () => {
    if (!user) {
      setMessage("Please login to place an order");
      setTimeout(() => setMessage(""), 3000);
      navigate("/login");
      return;
    }

    if (!product) return;

    // Create order from single product
    const order = {
      items: [
        {
          product: product._id,
          quantity: 1,
        },
      ],
      seller: product.seller._id,
      totalAmount: product.price,
    };

    // Store order in sessionStorage temporarily
    sessionStorage.setItem("tempOrder", JSON.stringify(order));
    navigate("/user/checkout");
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/product/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/favourite", {
        credentials: "include",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      const isFav = data.data?.products?.some((p) => p._id === id);
      setIsFavorite(isFav || false);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      setMessage("Please login to add to favorites");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const url = isFavorite
        ? `http://localhost:5000/api/favourite/${id}`
        : "http://localhost:5000/api/favourite/add";
      const method = isFavorite ? "DELETE" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        credentials: "include",
        body: !isFavorite ? JSON.stringify({ productId: id }) : undefined,
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);
        setMessage(
          isFavorite ? "Removed from favorites" : "Added to favorites",
        );
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkUserPurchase = async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/order", {
        credentials: "include",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setUserOrders(data.data?.items || []);
    } catch (error) {
      console.log(error);
    }
  };

  const hasCompletedPurchase = () => {
    return userOrders.some(
      (order) =>
        order.payment?.status === "paid" &&
        order.items?.some(
          (item) => item.product?._id === id || item.product === id,
        ),
    );
  };

  const imageOptions = [
    product?.images?.main,
    product?.images?.side1,
    product?.images?.side2,
    product?.image,
  ].filter(Boolean);

  useEffect(() => {
    if (imageOptions.length > 0) {
      setSelectedImage(imageOptions[0]);
    }
  }, [product?.images, product?.image]);

  const productImageUrl =
    selectedImage ||
    product?.images?.main ||
    product?.image ||
    product?.images?.side1 ||
    product?.images?.side2 ||
    "/Images/m4.png";

  const productThumbnails = imageOptions.slice(0, 4);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewMessage("Please login to submit a review");
      return;
    }

    const purchasedOrder = userOrders.find(
      (order) =>
        order.payment?.status === "paid" &&
        order.items?.some(
          (item) => item.product?._id === id || item.product === id,
        ),
    );

    if (!purchasedOrder) {
      setReviewMessage(
        "You must purchase and complete payment for this product to review it",
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          productId: id,
          orderId: purchasedOrder._id,
          rating: parseInt(reviewForm.rating),
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewMessage("Review submitted successfully!");
        setReviewForm({ rating: 5, title: "", comment: "" });
        fetchProduct();
        setTimeout(() => setReviewMessage(""), 3000);
      } else {
        setReviewMessage(data.message || "Failed to submit review");
      }
    } catch (error) {
      setReviewMessage("Error submitting review");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
    checkFavorite();
    checkUserPurchase();
  }, [id, user]);

  if (!product) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-100 text-blue-800 border border-blue-400">
          {message}
        </div>
      )}

      {/* TOP SECTION */}
      <div className="grid md:grid-cols-2 gap-10 bg-white p-6 rounded-xl shadow">
        {/* PRODUCT IMAGES */}
        <div>
          <img
            src={productImageUrl}
            alt={product.name}
            className="w-full rounded-lg border"
          />

          <div className="flex gap-3 mt-4">
            {productThumbnails.map((thumbnail, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(thumbnail)}
                className={`rounded overflow-hidden border ${
                  selectedImage === thumbnail
                    ? "border-indigo-600"
                    : "border-gray-300"
                }`}
                style={{ width: 80, height: 80, padding: 0 }}
              >
                <img
                  src={thumbnail}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          <p className="text-yellow-500 font-medium">
            ⭐ {product.rating} ({product.reviewCount} reviews)
          </p>

          <h2 className="text-2xl font-bold text-gray-800">${product.price}</h2>
          <p
            className={`font-medium ${
              product.availableStock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.availableStock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-3">
            <button
              onClick={carthandler}
              disabled={product.availableStock === 0}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              Add to Cart
            </button>

            <button
              onClick={orderHandler}
              disabled={product.availableStock === 0}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              Order Now
            </button>

            <button
              onClick={toggleFavorite}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isFavorite ? "♥ Favorited" : "♡ Add to Favorites"}
            </button>
          </div>

          {/* SELLER INFO */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-lg">Seller</h3>
            <p>{product.seller.shopname}</p>
            <p className="text-gray-500 text-sm">
              {typeof product.seller.shopaddress === "string"
                ? product.seller.shopaddress
                : product.seller.shopaddress
                  ? `${product.seller.shopaddress.street || ""}, ${product.seller.shopaddress.city || ""}, ${product.seller.shopaddress.postalcode || ""}, ${product.seller.shopaddress.country || ""}`.replace(
                      /^, |, $/,
                      "",
                    )
                  : "No address provided"}
            </p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* ADD REVIEW SECTION */}
      {hasCompletedPurchase() && (
        <div className="bg-white mt-8 p-6 rounded-xl shadow border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-4">✅ Write a Review</h2>
          {reviewMessage && (
            <div
              className={`mb-4 p-3 rounded text-sm ${
                reviewMessage.includes("successfully")
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {reviewMessage}
            </div>
          )}
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Poor</option>
                <option value="1">⭐ Terrible</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, title: e.target.value })
                }
                placeholder="Summarize your review"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                placeholder="Share your experience with this product"
                required
                rows="4"
                className="w-full p-2 border rounded"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}

      {/* REVIEWS */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Customer Reviews ({product.reviewCount || 0})
        </h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <div key={index} className="border-b pb-3">
                <p className="font-semibold">
                  {review.user?.firstname || "User"}{" "}
                  {review.user?.lastname || ""}
                </p>

                <p className="text-yellow-500">⭐ {review.rating}</p>
                <p className="font-medium text-gray-700">{review.title}</p>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductDetailspage;
