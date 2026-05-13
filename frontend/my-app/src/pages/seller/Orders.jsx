import React, { useEffect, useState, useContext } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import { useSocket } from "../../context/SocketContext";
import { getUserFriendlyError } from "../../utils/errorFormatter";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [orderStatus, setOrderStatus] = useState("");
  const [sellerStatus, setSellerStatus] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { showError, showSuccess } = useContext(NotificationContext);
  const { socket } = useSocket();

  // Fetch seller orders
  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        showError("No authentication token. Please log in again.");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(orderStatus && { status: orderStatus }),
        ...(sellerStatus && { sellerStatus }),
      });

      const response = await fetch(
        `http://localhost:5000/api/seller/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load orders");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Orders request failed");
      }

      setOrders(json.data.items || []);
      setTotalItems(json.data.total || 0);
      setPage(currentPage);
    } catch (err) {
      showError(getUserFriendlyError(err, "load orders"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Accept order
  const acceptOrder = async (orderId) => {
    setLoading(true);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        showError("No authentication token. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/orders/${orderId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to accept order");
      }

      if (!json.success) {
        throw new Error(json.message || "Accept operation failed");
      }

      showSuccess("Order accepted successfully!");
      setSelectedOrderId(null);
      fetchOrders(page);
    } catch (err) {
      showError(getUserFriendlyError(err, "accept order"));
    } finally {
      setLoading(false);
    }
  };

  // Reject order
  const rejectOrder = async (orderId) => {
    setLoading(true);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        showError("No authentication token. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/orders/${orderId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to reject order");
      }

      if (!json.success) {
        throw new Error(json.message || "Reject operation failed");
      }

      showSuccess("Order rejected successfully!");
      setSelectedOrderId(null);
      fetchOrders(page);
    } catch (err) {
      showError(getUserFriendlyError(err, "reject order"));
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    setLoading(true);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        showError("No authentication token. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/orders/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to delete order");
      }

      if (!json.success) {
        throw new Error(json.message || "Delete operation failed");
      }

      showSuccess("Order deleted successfully!");
      setSelectedOrderId(null);
      fetchOrders(page);
    } catch (err) {
      showError(getUserFriendlyError(err, "delete order"));
    } finally {
      setLoading(false);
    }
  };

  // Ship order
  const shipOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to ship this order?")) {
      return;
    }

    setLoading(true);

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        showError("No authentication token. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/order/ship/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to ship order");
      }

      if (!json.success) {
        throw new Error(json.message || "Ship operation failed");
      }

      showSuccess("Order shipped successfully!");
      setSelectedOrderId(null);
      fetchOrders(page);
    } catch (err) {
      showError(getUserFriendlyError(err, "ship order"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [orderStatus, sellerStatus, limit]);

  // Listen to socket events for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      console.log(
        "Orders page: New order received, refetching orders...",
        order,
      );
      // Refetch orders to show the new order
      fetchOrders(1);
    };

    const handleOrderUpdate = (data) => {
      console.log("Orders page: Order updated, refetching orders...", data);
      // Refetch orders to reflect the update
      fetchOrders(page);
    };

    socket.on("new-order", handleNewOrder);
    socket.on("order-update", handleOrderUpdate);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-update", handleOrderUpdate);
    };
  }, [socket, page]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          color: "#2c3e50",
          marginBottom: "20px",
          fontSize: "28px",
          fontWeight: "bold",
        }}
      >
        Orders Management
      </h1>

      <div
        style={{
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        <div>
          <label
            htmlFor="order-status"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Order Status:
          </label>
          <select
            id="order-status"
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setPage(1);
            }}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">All Order Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="seller-status"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Seller Status:
          </label>
          <select
            id="seller-status"
            value={sellerStatus}
            onChange={(e) => {
              setSellerStatus(e.target.value);
              setPage(1);
            }}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">All Seller Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && <p>No orders found</p>}

      {!loading && orders.length > 0 && (
        <div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#3498db", color: "white" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Order ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Customer
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Order Status
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
                  Seller Status
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Total Amount
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id || order.id}>
                  <tr
                    style={{
                      backgroundColor:
                        orders.indexOf(order) % 2 === 0 ? "#f8f9fa" : "white",
                    }}
                  >
                    <td style={{ padding: "12px", border: "none" }}>
                      {order._id || order.id || "N/A"}
                    </td>
                    <td style={{ padding: "12px", border: "none" }}>
                      {order.user?.username || "N/A"}
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
                                  : "#ffc107",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", border: "none" }}>
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
                    <td style={{ padding: "12px", border: "none" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          backgroundColor:
                            order.sellerStatus === "accepted"
                              ? "#28a745"
                              : order.sellerStatus === "completed"
                                ? "#17a2b8"
                                : order.sellerStatus === "rejected"
                                  ? "#dc3545"
                                  : "#ffc107",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {order.sellerStatus || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", border: "none" }}>
                      ₨{parseFloat(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", border: "none" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          flexWrap: "wrap",
                        }}
                      >
                        {order.sellerStatus === "pending" && (
                          <>
                            <button
                              onClick={() => acceptOrder(order._id || order.id)}
                              disabled={loading}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: loading ? "default" : "pointer",
                                fontSize: "12px",
                                opacity: loading ? 0.5 : 1,
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectOrder(order._id || order.id)}
                              disabled={loading}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: loading ? "default" : "pointer",
                                fontSize: "12px",
                                opacity: loading ? 0.5 : 1,
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.sellerStatus === "accepted" &&
                          order.shipping?.status === "pending" &&
                          (order.paymentStatus === "paid" ? (
                            <button
                              onClick={() => shipOrder(order._id || order.id)}
                              disabled={loading}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: loading ? "default" : "pointer",
                                fontSize: "12px",
                                opacity: loading ? 0.5 : 1,
                              }}
                            >
                              Ship
                            </button>
                          ) : (
                            <button
                              disabled
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                opacity: 0.6,
                              }}
                            >
                              Awaiting Payment
                            </button>
                          ))}
                        {(order.sellerStatus === "completed" ||
                          order.sellerStatus === "rejected") && (
                          <button
                            onClick={() => deleteOrder(order._id || order.id)}
                            disabled={loading}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: loading ? "default" : "pointer",
                              fontSize: "12px",
                              opacity: loading ? 0.5 : 1,
                            }}
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setSelectedOrderId(
                              selectedOrderId === (order._id || order.id)
                                ? null
                                : order._id || order.id,
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
                          {selectedOrderId === (order._id || order.id)
                            ? "Hide Details"
                            : "Details"}
                        </button>
                        {order.sellerStatus !== "pending" &&
                          order.sellerStatus !== "completed" && (
                            <button
                              disabled
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "default",
                                fontSize: "12px",
                              }}
                            >
                              No Actions
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                  {selectedOrderId === (order._id || order.id) && (
                    <tr
                      key={`details-${order._id || order.id}`}
                      style={{ backgroundColor: "#f9f9f9" }}
                    >
                      <td
                        colSpan={7}
                        style={{ padding: "16px", border: "1px solid #ddd" }}
                      >
                        <div style={{ display: "grid", gap: "14px" }}>
                          <div>
                            <strong>Customer:</strong>{" "}
                            {order.user?.username || "N/A"} <br />
                            <strong>Email:</strong> {order.user?.email || "N/A"}{" "}
                            <br />
                            <strong>Phone:</strong>{" "}
                            {order.user?.phonenumber || "N/A"}
                          </div>
                          <div>
                            <strong>Shipping Address:</strong>
                            <div
                              style={{ marginTop: "6px", paddingLeft: "10px" }}
                            >
                              <div>
                                {order.shippingAddress?.street || "N/A"}
                              </div>
                              <div>
                                {order.shippingAddress?.city || ""},{" "}
                                {order.shippingAddress?.postalcode || ""}
                              </div>
                              <div>{order.shippingAddress?.country || ""}</div>
                              <div>
                                {order.shippingAddress?.phonenumber || ""}
                              </div>
                            </div>
                          </div>
                          <div>
                            <strong>Items:</strong>
                            <div style={{ marginTop: "8px" }}>
                              {order.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <div>
                                    <strong>
                                      {item.product?.name || "Product"}
                                    </strong>
                                  </div>
                                  <div>Qty: {item.quantity}</div>
                                  <div>
                                    Price: $
                                    {parseFloat(
                                      item.product?.price || 0,
                                    ).toFixed(2)}
                                  </div>
                                  <div>
                                    Subtotal: $
                                    {(
                                      (item.product?.price || 0) * item.quantity
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <strong>Order Total:</strong> $
                            {parseFloat(order.totalAmount || 0).toFixed(2)}
                          </div>
                          <div>
                            <strong>Payment Status:</strong>{" "}
                            {order.paymentStatus ||
                              order.payment?.status ||
                              "Unknown"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
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
