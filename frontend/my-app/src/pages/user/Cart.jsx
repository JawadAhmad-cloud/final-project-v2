import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Cart = () => {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    user,
    removeOrderedItems,
  } = useContext(AuthContext);

  const shippingAddress = user?.address;

  const selectedItems = cart.filter((item) => item.isSelected);

  const subtotal = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    const items = selectedItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        items,
        shippingAddress,
      }),
    });

    const data = await res.json();

    if (data.success) {
      removeOrderedItems(items);
      window.location.href = `/checkout/${data.data.orderId}`;
    } else {
      alert(data.message);
    }
  };

  const toggleSelect = (id) => {
    const updated = cart.map((item) =>
      item._id === id
        ? { ...item, isSelected: !item.isSelected }
        : item
    );
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 bg-white border shadow rounded-2xl p-5">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            Your Cart
          </h2>

          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 border-b py-4"
              >
                <input
                  type="checkbox"
                  checked={item.isSelected || false}
                  onChange={() => toggleSelect(item._id)}
                  className="accent-purple-600"
                />

                <img
                  src={item.image}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h3>{item.name}</h3>
                  <p className="text-purple-600 font-bold">
                    Rs {item.price}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => decreaseQty(item._id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item._id)}>
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white border shadow rounded-2xl p-5 h-fit">
          <h2 className="text-xl font-bold text-purple-600 mb-4">
            Summary
          </h2>

          <p>Items: {selectedItems.length}</p>
          <p>Total: Rs {subtotal}</p>

          <button
            onClick={handleCheckout}
            disabled={!selectedItems.length}
            className={`w-full mt-4 py-3 rounded-xl text-white ${
              selectedItems.length
                ? "bg-purple-600"
                : "bg-gray-300"
            }`}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;