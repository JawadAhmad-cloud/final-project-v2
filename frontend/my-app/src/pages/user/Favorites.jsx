import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Get all favorites
  const getFavorites = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/favourite", {
        method: "GET",
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setFavorites(data.data.products || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove single item
  const removeFromFav = async (productId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/favourite/${productId}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      // update UI
      setFavorites((prev) => prev.filter((item) => item._id !== productId));

      toast.success("Removed from favorites 💔");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Clear all
  const clearFavorites = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/favourite/clear", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setFavorites([]);
      toast.success("All favorites cleared 🗑️");
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getFavorites();
  }, []);

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading favorites...</p>
      </div>
    );
  }

  // ✅ Empty state
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold">No Favorites Yet ❤️</h2>
        <p className="text-gray-500 mt-2">
          Start adding products to your favorites
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Favorites ❤️</h1>

        <button
          onClick={clearFavorites}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Clear All
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((product) => {
          const imageUrl =
            product.images?.main ||
            product.image ||
            product.images?.side1 ||
            product.images?.side2 ||
            "/Images/m4.png";

          return (
            <div
              key={product._id || product.id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              {/* Image */}
              <Link to={`/user/product/${product._id || product.id}`}>
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </Link>

              {/* Info */}
              <h2 className="text-lg font-semibold mt-3">{product.name}</h2>

              <p className="text-gray-600">₨{product.price}</p>

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <Link
                  to={`/user/product/${product._id || product.id}`}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-center hover:bg-blue-600"
                >
                  View
                </Link>

                <button
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                  onClick={() => alert("Order flow here")}
                >
                  Order Now
                </button>

                <button
                  onClick={() => removeFromFav(product._id || product.id)}
                  className="flex-1 bg-gray-200 text-black py-2 rounded-lg hover:bg-gray-300"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Favorites;

