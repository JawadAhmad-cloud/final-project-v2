import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Checkout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Review, 2: Payment
  const [paymentData, setPaymentData] = useState({
    cardNumber: "4111111111111111",
    expiryDate: "12/25",
    cvv: "123",
    cardholderName: "",
  });

  // Fetch order details if orderId is provided
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      // Check if there's a temp order in session storage
      const tempOrder = sessionStorage.getItem("tempOrder");
      if (tempOrder) {
        createOrderFromCart();
      }
    }
  }, [orderId]);

  // Create checkout session when order is accepted
  useEffect(() => {
    if (order && order.sellerStatus === "accepted" && !checkoutSession) {
      createCheckoutSession();
    }
  }, [order]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Fetch order details to show in review
      const orderRes = await fetch(
        `http://localhost:5000/api/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!orderRes.ok) {
        throw new Error("Failed to load order");
      }

      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrder(orderData.data);
      } else {
        throw new Error(orderData.message || "Failed to load order");
      }
    } catch (err) {
      setError(err.message || "Unable to load order");
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    if (!order) return;

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Create checkout session
      const checkoutRes = await fetch(
        `http://localhost:5000/api/order/${order._id}/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentMethod: "card" }),
        },
      );

      if (!checkoutRes.ok) {
        throw new Error("Failed to create checkout session");
      }

      const checkoutData = await checkoutRes.json();
      if (checkoutData.success) {
        setCheckoutSession(checkoutData.data);
      } else {
        setError(checkoutData.message || "Failed to create checkout session");
      }
    } catch (err) {
      setError(err.message || "Failed to create checkout session");
    }
  };

  const createOrderFromCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const tempOrder = JSON.parse(sessionStorage.getItem("tempOrder"));
      sessionStorage.removeItem("tempOrder");

      const response = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: tempOrder.items,
          shippingAddress: {
            street: "Temp Street",
            city: "Temp City",
            postalcode: "12345",
            country: "Temp Country",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      if (data.success) {
        // Redirect to checkout with the new orderId
        navigate(`/user/checkout/${data.data.orderId}`);
      }
    } catch (err) {
      setError(err.message || "Unable to create order");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!checkoutSession) {
      setError("Checkout session not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/order/payment/process",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkoutId: checkoutSession.checkoutId || checkoutSession._id,
            cardNumber: paymentData.cardNumber,
            expiryDate: paymentData.expiryDate,
            cvv: paymentData.cvv,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Payment processing failed");
      }
      if (data.success) {
        alert("Payment successful! Order has been confirmed.");
        navigate("/user/orders");
      } else {
        throw new Error(data.message || "Payment failed");
      }
    } catch (err) {
      setError(err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return <div className="p-10 text-center">Loading checkout...</div>;
  }

  if (!order && !checkoutSession) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500">Unable to load checkout page</p>
        <button
          onClick={() => navigate("/user/cart")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <h1>Checkout</h1>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      {/* Order Status Check */}
      {order && order.sellerStatus === "pending" && (
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#856404", marginTop: 0 }}>
            Order Pending Approval
          </h2>
          <p style={{ color: "#856404", marginBottom: "15px" }}>
            Your order is waiting for seller approval. You will be able to
            proceed with payment once the seller accepts your order.
          </p>
          <p style={{ color: "#856404", fontSize: "14px" }}>
            Order Status: <strong>Pending</strong>
          </p>
          <button
            onClick={() => navigate("/user/orders")}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            View Order Status
          </button>
        </div>
      )}

      {order && order.sellerStatus === "rejected" && (
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#721c24", marginTop: 0 }}>Order Rejected</h2>
          <p style={{ color: "#721c24", marginBottom: "15px" }}>
            Unfortunately, your order has been rejected by the seller.
          </p>
          <p style={{ color: "#721c24", fontSize: "14px" }}>
            Order Status: <strong>Rejected</strong>
          </p>
          <button
            onClick={() => navigate("/user/cart")}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Cart
          </button>
        </div>
      )}

      {order && order.sellerStatus === "accepted" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "30px",
          }}
        >
          {/* Main Content */}
          <div>
            {/* Step 1: Review Order */}
            <div
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: step === 1 ? "#f0f7ff" : "#f5f5f5",
                borderRadius: "8px",
                border: step === 1 ? "2px solid #007bff" : "1px solid #ddd",
              }}
            >
              <h2 style={{ marginTop: 0 }}>1. Order Review</h2>

              {order && (
                <div>
                  <p style={{ marginBottom: "15px" }}>
                    <strong>Seller:</strong> {order.seller?.shopname || "N/A"}
                  </p>

                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "4px",
                      marginBottom: "15px",
                    }}
                  >
                    <h3>Items</h3>
                    {order.items && order.items.length > 0 ? (
                      <table style={{ width: "100%" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #ddd" }}>
                            <th style={{ textAlign: "left", padding: "8px" }}>
                              Product
                            </th>
                            <th style={{ textAlign: "center", padding: "8px" }}>
                              Qty
                            </th>
                            <th style={{ textAlign: "right", padding: "8px" }}>
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr
                              key={idx}
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              <td style={{ padding: "8px" }}>
                                {item.product?.name || "Product"}
                              </td>
                              <td
                                style={{ textAlign: "center", padding: "8px" }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                style={{ textAlign: "right", padding: "8px" }}
                              >
                                $
                                {(
                                  (item.product?.price || 0) * item.quantity
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No items in order</p>
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "4px",
                    }}
                  >
                    <h3>Shipping Address</h3>
                    <p>
                      {order.shippingAddress?.street || "N/A"}
                      <br />
                      {order.shippingAddress?.city || "N/A"},{" "}
                      {order.shippingAddress?.postalcode || "N/A"}
                      <br />
                      {order.shippingAddress?.country || "N/A"}
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    style={{
                      marginTop: "15px",
                      padding: "10px 20px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loading ? "default" : "pointer",
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div
              style={{
                padding: "20px",
                backgroundColor: step === 2 ? "#f0f7ff" : "#f5f5f5",
                borderRadius: "8px",
                border: step === 2 ? "2px solid #007bff" : "1px solid #ddd",
              }}
            >
              <h2 style={{ marginTop: 0 }}>2. Payment Details</h2>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Card Number:
                </label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cardNumber: e.target.value,
                    })
                  }
                  placeholder="4111 1111 1111 1111"
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
                <small
                  style={{ display: "block", marginTop: "5px", color: "#666" }}
                >
                  Test: 4111111111111111
                </small>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Expiry Date:
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        expiryDate: e.target.value,
                      })
                    }
                    placeholder="MM/YY"
                    style={{
                      width: "100%",
                      padding: "10px",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    CVV:
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cvv: e.target.value,
                      })
                    }
                    placeholder="123"
                    style={{
                      width: "100%",
                      padding: "10px",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Cardholder Name:
                </label>
                <input
                  type="text"
                  value={paymentData.cardholderName}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cardholderName: e.target.value,
                    })
                  }
                  placeholder="Enter name on card"
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: Order Summary */}
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              height: "fit-content",
            }}
          >
            <h3>Order Summary</h3>

            <div
              style={{
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Subtotal:</span>
                <span>₨{(order?.totalPrice || 0).toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Shipping:</span>
                <span>$0.00</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              <span>Total:</span>
              <span>₨{(order?.totalAmount || 0).toFixed(2)}</span>
            </div>

            <div
              style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                padding: "10px",
                fontSize: "12px",
              }}
            >
              <strong>Test Card:</strong>
              <p style={{ margin: "5px 0" }}>Number: 4111111111111111</p>
              <p style={{ margin: "5px 0" }}>Expiry: 12/25</p>
              <p style={{ margin: "5px 0" }}>CVV: 123</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

