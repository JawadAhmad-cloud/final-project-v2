import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  // Fetch user orders
  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });

      const response = await fetch(
        `http://localhost:5000/api/order?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Orders request failed");
      }

      setOrders(json.data.items || json.data || []);
      setTotalItems(json.data.total || 0);
      setPage(currentPage);
    } catch (err) {
      setError(err.message || "Unable to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Checkout handler
  const handleCheckout = (orderId) => {
    navigate(`/user/checkout/${orderId}`);
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Refetch orders when window gets focus (e.g., when navigating back)
  useEffect(() => {
    const handleFocus = () => {
      fetchOrders(1);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>My Orders</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && <p>No orders found</p>}

      {!loading && orders.length > 0 && (
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Order ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Seller
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Shipping Status
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Total Amount
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Created Date
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => [
                <tr key={`order-${order._id || order.id}`}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {(order._id || order.id || "N/A").slice(-8)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {order.seller?.shopname || "N/A"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        backgroundColor:
                          order.status === "delivered"
                            ? "#28a745"
                            : order.status === "shipped"
                              ? "#17a2b8"
                              : order.status === "rejected"
                                ? "#dc3545"
                                : order.sellerStatus === "accepted"
                                  ? "#007bff"
                                  : "#ffc107",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        backgroundColor:
                          order.shipping?.status === "delivered"
                            ? "#28a745"
                            : order.shipping?.status === "in_transit"
                              ? "#17a2b8"
                              : "#ffc107",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {order.shipping?.status || "pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    ${parseFloat(order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "5px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedOrder(
                            expandedOrder === order._id ? null : order._id,
                          )
                        }
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {expandedOrder === order._id ? "Hide Items" : "Items"}
                      </button>
                      {order.sellerStatus === "accepted" &&
                        order.payment?.status !== "paid" && (
                          <button
                            onClick={() => handleCheckout(order._id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Checkout
                          </button>
                        )}
                      {order.shipping?.trackingNumber && (
                        <button
                          onClick={() =>
                            alert(
                              `Tracking #: ${order.shipping.trackingNumber}`,
                            )
                          }
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Track
                        </button>
                      )}
                    </div>
                  </td>
                </tr>,
                expandedOrder === order._id && order.items ? (
                  <tr key={`expanded-${order._id || order.id}`} style={{ backgroundColor: "#f9f9f9" }}>
                    <td colSpan={7} style={{ padding: "12px" }}>
                      <div style={{ marginLeft: "20px" }}>
                        <h4 style={{ marginBottom: "10px" }}>
                          Items in this order:
                        </h4>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ marginBottom: "10px" }}>
                            <button
                              onClick={() =>
                                navigate(
                                  `/user/product/${item.product?._id || item.product}`,
                                )
                              }
                              style={{
                                color: "#007bff",
                                textDecoration: "underline",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                              }}
                            >
                              {item.product?.name || "Product"}
                            </button>
                            <span
                              style={{ marginLeft: "10px", color: "#666" }}
                            >
                              Qty: {item.quantity} | $
                              {(
                                (item.product?.price || 0) * item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null,
              ])}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => fetchOrders(page - 1)}
                disabled={page === 1}
                style={{
                  padding: "8px 16px",
                  backgroundColor: page === 1 ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: page === 1 ? "default" : "pointer",
                }}
              >
                Previous
              </button>
              <span style={{ alignSelf: "center" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchOrders(page + 1)}
                disabled={page === totalPages}
                style={{
                  padding: "8px 16px",
                  backgroundColor: page === totalPages ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: page === totalPages ? "default" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
