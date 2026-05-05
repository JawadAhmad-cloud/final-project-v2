import React, { useEffect, useState } from "react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    totalStock: "",
  });

  // Fetch products
  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(search && { search }),
        ...(category && { category }),
        ...(status && { status }),
      });

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/seller/products?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Products request failed");
      }

      setProducts(json.data.products || []);
      setTotalItems(json.data.pagination?.total || 0);
      setPage(currentPage);
    } catch (err) {
      setError(err.message || "Unable to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Create or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      !formData.totalStock
    ) {
      alert("Please fill in all fields");
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

      const method = editingProductId ? "PUT" : "POST";
      const url = editingProductId
        ? `http://localhost:5000/api/seller/products/${editingProductId}`
        : `http://localhost:5000/api/seller/products`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          totalStock: parseInt(formData.totalStock),
        }),
      });

      if (!response.ok) {
        throw new Error(
          editingProductId
            ? "Failed to update product"
            : "Failed to create product",
        );
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Product operation failed");
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        totalStock: "",
      });
      setEditingProductId(null);
      setShowCreateForm(false);
      fetchProducts(1);
    } catch (err) {
      setError(err.message || "Unable to save product");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
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
        `http://localhost:5000/api/seller/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Delete failed");
      }

      fetchProducts(page);
    } catch (err) {
      setError(err.message || "Unable to delete product");
    } finally {
      setLoading(false);
    }
  };

  // Toggle product status
  const toggleProductStatus = async (productId, currentStatus) => {
    const statusOptions = ["active", "inactive", "discontinued"];
    const newStatus =
      statusOptions[
        (statusOptions.indexOf(currentStatus) + 1) % statusOptions.length
      ];

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
        `http://localhost:5000/api/seller/products/${productId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update product status");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Status update failed");
      }

      fetchProducts(page);
    } catch (err) {
      setError(err.message || "Unable to update product status");
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const startEdit = (product) => {
    setEditingProductId(product._id || product.id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      totalStock: product.totalStock || product.stock || "",
    });
    setShowCreateForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      totalStock: "",
    });
    setEditingProductId(null);
    setShowCreateForm(false);
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, category, status, limit]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Products Management</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() =>
            showCreateForm ? resetForm() : setShowCreateForm(true)
          }
          style={{
            padding: "8px 16px",
            backgroundColor: showCreateForm ? "#dc3545" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showCreateForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>{editingProductId ? "Edit Product" : "Create New Product"}</h3>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="name"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Product Name:
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter product name"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="description"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Description:
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter product description"
              rows="4"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <div
            style={{
              marginBottom: "15px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label
                htmlFor="price"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Price:
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Category:
              </label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Enter category"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="totalStock"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Total Stock:
            </label>
            <input
              id="totalStock"
              type="number"
              value={formData.totalStock}
              onChange={(e) =>
                setFormData({ ...formData, totalStock: e.target.value })
              }
              placeholder="0"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading
              ? "Saving..."
              : editingProductId
                ? "Update Product"
                : "Create Product"}
          </button>
        </form>
      )}

      <div
        style={{
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && <p>No products found</p>}

      {!loading && products.length > 0 && (
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
                  Price
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Stock
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id || product.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {product.name || "N/A"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {product.totalStock || product.stock || 0}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() =>
                        toggleProductStatus(
                          product._id || product.id,
                          product.status || "active",
                        )
                      }
                      style={{
                        padding: "4px 8px",
                        backgroundColor:
                          product.status === "active"
                            ? "#28a745"
                            : product.status === "inactive"
                              ? "#ffc107"
                              : "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {product.status || "active"}
                    </button>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => startEdit(product)}
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
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id || product.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => fetchProducts(page - 1)}
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
                onClick={() => fetchProducts(page + 1)}
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

export default Products;
