import React, { useContext, useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function ProductDetailspage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const {addToCart} = useContext(AuthContext)
  const carthandler=()=>{
    if(!product) return
    addToCart({
      _id:product._id,
         name: product.name,
    price: product.price,
    image: product.images?.main,
    seller: product.seller?.shopname
    })
  }
  const fetchProduct = async () => {
    //fetching the products details from backend
    try {
      const res = await fetch(`http://localhost:5000/api/product/${id}`);
      const data = await res.json();
        //setting the data in products
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, []);

  if (!product) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }
  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* TOP SECTION */}
      <div className="grid md:grid-cols-2 gap-10 bg-white p-6 rounded-xl shadow">

        {/* PRODUCT IMAGES */}
        <div>
          <img
            src={product.images?.main}
            alt={product.name}
            className="w-full rounded-lg border"
          />

          <div className="flex gap-3 mt-4">
            {product.images?.side1 && (
              <img
                src={product.images.side1}
                alt=""
                className="w-20 border rounded cursor-pointer"
              />
            )}

            {product.images?.side2 && (
              <img
                src={product.images.side2}
                alt=""
                className="w-20 border rounded cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col gap-4">

          <h1 className="text-3xl font-semibold">
            {product.name}
          </h1>

          <p className="text-yellow-500 font-medium">
            ⭐ {product.rating} ({product.reviewCount} reviews)
          </p>

          <h2 className="text-2xl font-bold text-gray-800">
            ${product.price}
          </h2>
          <p
            className={`font-medium ${
              product.availableStock > 0
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {product.availableStock > 0
              ? "In Stock"
              : "Out of Stock"}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-3">
            <button  onClick={carthandler}
             className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Add to Cart
            </button>

            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
              Buy Now
            </button>
          </div>

          {/* SELLER INFO */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-lg">Seller</h3>
            <p>{product.seller.shopname}</p>
            <p className="text-gray-500 text-sm">
              {product.seller.shopaddress}
            </p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">
          Description
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* REVIEWS */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Customer Reviews
        </h2>

        <div className="space-y-4">
          {product.reviews.map((review, index) => (
            <div
              key={index}
              className="border-b pb-3"
            >
              <p className="font-semibold">
                {review.user.firstname} {review.user.lastname}
              </p>

              <p className="text-yellow-500">
                ⭐ {review.rating}
              </p>

              <p className="text-gray-600">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailspage;