import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    user,
    removeOrderedItems,
    toggleSelect,
  } = useContext(AuthContext);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    street: "",
    city: "",
    postalcode: "",
    country: "",
  });

  const shippingAddress =
    user?.address || (showAddressForm ? shippingForm : null);

  const selectedItems = cart.filter((item) => item.isSelected);

  const subtotal = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    // Create order and send user to orders page
    if (!shippingAddress || !shippingAddress.street) {
      setShowAddressForm(true);
      return;
    }

    const items = selectedItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const storedUser = sessionStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const token = userData?.token;

    if (!token) {
      alert("Please log in first");
      return;
    }

    const res = await fetch("http://localhost:5000/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        shippingAddress,
      }),
    });

    const data = await res.json();

    if (data.success) {
      removeOrderedItems(items);
      navigate("/user/orders");
    } else {
      alert(data.message);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    // Validate form
    if (
      !shippingForm.street ||
      !shippingForm.city ||
      !shippingForm.postalcode ||
      !shippingForm.country
    ) {
      alert("Please fill in all shipping address fields");
      return;
    }

    // Create order and navigate to orders list
    const items = selectedItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const storedUser = sessionStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const token = userData?.token;

    if (!token) {
      alert("Please log in first");
      return;
    }

    const res = await fetch("http://localhost:5000/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        shippingAddress: shippingForm,
      }),
    });

    const data = await res.json();

    if (data.success) {
      removeOrderedItems(items);
      navigate("/user/orders");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white border shadow rounded-2xl p-5">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">Your Cart</h2>

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
                  src={
                    item.image ||
                    item.images?.main ||
                    item.images?.side1 ||
                    item.images?.side2 ||
                    "/Images/m4.png"
                  }
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h3>{item.name}</h3>
                  <p className="text-purple-600 font-bold">Rs {item.price}</p>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => decreaseQty(item._id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item._id)}>+</button>
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
          <h2 className="text-xl font-bold text-purple-600 mb-4">Summary</h2>

          <p>Items: {selectedItems.length}</p>
          <p>Total: Rs {subtotal}</p>

          {/* Shipping Address Form */}
          {showAddressForm && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Shipping Address</h3>
              <form onSubmit={handleAddressSubmit}>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingForm.street}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        street: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingForm.city}
                    onChange={(e) =>
                      setShippingForm({ ...shippingForm, city: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={shippingForm.postalcode}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        postalcode: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingForm.country}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        country: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Place Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {!showAddressForm && (
            <button
              onClick={handleCheckout}
              disabled={!selectedItems.length}
              className={`w-full mt-4 py-3 rounded-xl text-white ${
                selectedItems.length ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              Place Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
