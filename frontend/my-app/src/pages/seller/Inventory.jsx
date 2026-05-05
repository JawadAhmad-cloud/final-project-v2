import React, { useEffect, useState } from "react";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [threshold, setThreshold] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const defaultSummary = {
    totalProducts: 0,
    totalStock: 0,
    totalAvailable: 0,
    totalReserved: 0,
  };
  const [summary, setSummary] = useState(defaultSummary);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  // Fetch main inventory with pagination
  const fetchInventory = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/inventory?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load inventory data");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Inventory request failed");
      }

      setInventory(json.data.products || []);
      setTotalItems(json.data.pagination.total || 0);
      setSummary(json.data.summary || defaultSummary);
      setPage(currentPage);
    } catch (err) {
      setError(err.message || "Unable to load inventory data");
      setInventory([]);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  };

  // Fetch low stock products
  const fetchLowStockProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/inventory/low-stock?threshold=${threshold}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load low stock data");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Low stock request failed");
      }

      setLowStockProducts(json.data || []);
    } catch (err) {
      setError(err.message || "Unable to load low stock data");
      setLowStockProducts([]);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  };

  // Update product stock
  const updateStock = async (productId) => {
    if (!newStock || isNaN(newStock)) {
      alert("Please enter a valid stock number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/inventory/stock/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ totalStock: parseInt(newStock) }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Stock update failed");
      }

      setEditingProductId(null);
      setNewStock("");
      fetchInventory(page);
    } catch (err) {
      setError(err.message || "Unable to update stock");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (showLowStock) {
      fetchLowStockProducts();
    } else {
      fetchInventory(1);
    }
  }, [showLowStock, threshold]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ margin: "0" }}>Inventory Management</h1>
        <button
          onClick={() => fetchInventory(page)}
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: loading ? "#ccc" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#059669";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#10b981";
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              border: "1px solid #90caf9",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#1565c0",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Total Products
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#0d47a1",
              }}
            >
              {summary.totalProducts || 0}
            </p>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f3e5f5",
              borderRadius: "8px",
              border: "1px solid #ce93d8",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#6a1b9a",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Total Stock
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#4a148c",
              }}
            >
              {summary.totalStock || 0}
            </p>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
              border: "1px solid #81c784",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#2e7d32",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Available Stock
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#1b5e20",
              }}
            >
              {summary.totalAvailable || 0}
            </p>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff3e0",
              borderRadius: "8px",
              border: "1px solid #ffb74d",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#e65100",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Reserved Stock
            </p>
            <p
              style={{
                margin: "0",
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#bf360c",
              }}
            >
              {summary.totalReserved || 0}
            </p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setShowLowStock(false)}
          style={{
            padding: "8px 16px",
            backgroundColor: !showLowStock ? "#007bff" : "#e9ecef",
            color: !showLowStock ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          All Inventory
        </button>
        <button
          onClick={() => setShowLowStock(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: showLowStock ? "#ffc107" : "#e9ecef",
            color: showLowStock ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Low Stock Alerts
        </button>
      </div>

      {showLowStock && (
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="threshold-input" style={{ marginRight: "10px" }}>
            Low Stock Threshold:
          </label>
          <input
            id="threshold-input"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            min="1"
            style={{ padding: "6px", marginRight: "10px" }}
          />
        </div>
      )}

      {loading && <p>Loading inventory...</p>}

      {!loading && !showLowStock && inventory.length === 0 && (
        <p>No products in inventory</p>
      )}

      {!loading && showLowStock && lowStockProducts.length === 0 && (
        <p>No low stock products</p>
      )}

      {!loading && (showLowStock ? lowStockProducts : inventory).length > 0 && (
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
                  Product Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Current Stock
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {(showLowStock ? lowStockProducts : inventory).map((product) => (
                <tr key={product._id || product.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {product.name || "N/A"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {product.category || "N/A"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {editingProductId === (product._id || product.id) ? (
                      <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        min="0"
                        style={{ padding: "4px", width: "80px" }}
                      />
                    ) : (
                      product.totalStock || product.stock || 0
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {editingProductId === (product._id || product.id) ? (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => updateStock(product._id || product.id)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingProductId(null);
                            setNewStock("");
                          }}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingProductId(product._id || product.id);
                          setNewStock(product.totalStock || product.stock || 0);
                        }}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!showLowStock && totalPages > 1 && (
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => fetchInventory(page - 1)}
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
                onClick={() => fetchInventory(page + 1)}
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

export default Inventory;
