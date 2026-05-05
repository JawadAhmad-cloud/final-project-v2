import React, { useEffect, useState } from "react";

const Analytics = () => {
  const [period, setPeriod] = useState("month");
  const defaultAnalytics = {
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0,
    inventorySummary: {
      totalProducts: 0,
      totalStock: 0,
      totalReserved: 0,
      totalAvailable: 0,
    },
    lowStockAlerts: [],
    trends: [],
  };
  const [analytics, setAnalytics] = useState(defaultAnalytics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (selectedPeriod) => {
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
        `http://localhost:5000/api/seller/analytics?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Analytics request failed");
      }

      setAnalytics(json.data || defaultAnalytics);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Unable to load analytics data");
      setAnalytics(defaultAnalytics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const StatCard = ({ title, value, icon, color, unit = "" }) => (
    <div
      style={{
        padding: "24px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
        border: `2px solid ${color}`,
        boxShadow: `0 4px 15px ${color}30`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = `0 8px 25px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 15px ${color}30`;
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: color,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: color,
            }}
          >
            {value}
            <span style={{ fontSize: "1rem", marginLeft: "4px" }}>{unit}</span>
          </p>
        </div>
        <div
          style={{
            fontSize: "2.5rem",
            opacity: 0.3,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 8px 0",
              color: "#1a1a1a",
              fontSize: "2.2rem",
            }}
          >
            📊 Analytics Dashboard
          </h1>
          <p style={{ margin: "0", color: "#666", fontSize: "0.95rem" }}>
            Track your sales performance and inventory insights
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => fetchAnalytics(period)}
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
          <label
            htmlFor="period-select"
            style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Report Period:
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "2px solid #007bff",
              fontSize: "0.95rem",
              fontWeight: "500",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#333",
              transition: "all 0.3s ease",
            }}
          >
            <option value="week">📅 This Week</option>
            <option value="month">📆 This Month</option>
            <option value="year">📕 This Year</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            border: "2px solid #ef5350",
            borderRadius: "12px",
            padding: "16px",
            color: "#c62828",
            marginBottom: "24px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div
        style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s ease" }}
      >
        {/* Main Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            title="Total Revenue"
            value={`$${(analytics.totalRevenue || 0).toFixed(2)}`}
            icon="💰"
            color="#10b981"
            unit=""
          />
          <StatCard
            title="Total Sales"
            value={analytics.totalSales || 0}
            icon="🛍️"
            color="#3b82f6"
            unit="orders"
          />
          <StatCard
            title="Average Order Value"
            value={`$${(analytics.averageOrderValue || 0).toFixed(2)}`}
            icon="📈"
            color="#f59e0b"
            unit=""
          />
        </div>

        {/* Inventory Section */}
        {analytics.inventorySummary && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                color: "#1a1a1a",
                fontSize: "1.3rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📦 Inventory Summary
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f0f4ff",
                  borderRadius: "8px",
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "#666",
                    fontSize: "0.85rem",
                  }}
                >
                  Total Products
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  {analytics.inventorySummary.totalProducts ?? 0}
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "#666",
                    fontSize: "0.85rem",
                  }}
                >
                  Total Stock
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  {analytics.inventorySummary.totalStock ?? 0}
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fffbf0",
                  borderRadius: "8px",
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "#666",
                    fontSize: "0.85rem",
                  }}
                >
                  Available Stock
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: "#f59e0b",
                  }}
                >
                  {analytics.inventorySummary.totalAvailable ?? 0}
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "#666",
                    fontSize: "0.85rem",
                  }}
                >
                  Reserved Stock
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: "#ef4444",
                  }}
                >
                  {analytics.inventorySummary.totalReserved ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {analytics.lowStockAlerts && analytics.lowStockAlerts.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                color: "#1a1a1a",
                fontSize: "1.3rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚠️ Low Stock Alerts ({analytics.lowStockAlerts.length})
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "12px",
              }}
            >
              {analytics.lowStockAlerts.map((product, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                        color: "#7f1d1d",
                      }}
                    >
                      {product.name || "Unknown Product"}
                    </p>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "0.85rem",
                        color: "#991b1b",
                      }}
                    >
                      Stock: {product.currentStock ?? 0} / Threshold:{" "}
                      {product.threshold ?? 10}
                    </p>
                  </div>
                  <span
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {product.status || "Low"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Trends */}
        {analytics.trends && analytics.trends.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                color: "#1a1a1a",
                fontSize: "1.3rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📈 Revenue Trends
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f3f4f6",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Period
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Revenue
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Orders
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Avg Order Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.trends.map((trend, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td style={{ padding: "12px", color: "#374151" }}>
                        {trend._id || `Trend ${index + 1}`}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#10b981",
                        }}
                      >
                        ${(trend.revenue || 0).toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          color: "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        {trend.orders || 0}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          color: "#f59e0b",
                          fontWeight: "600",
                        }}
                      >
                        ${(trend.averageOrderValue || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
