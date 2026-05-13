import { useState, useEffect } from "react";
import {
  FaChartBar,
  FaChartLine,
  FaShoppingCart,
  FaDollarSign,
  FaSync,
} from "react-icons/fa";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueByMonth: [],
    orderStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const storedAdmin = sessionStorage.getItem("admin");
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
  const token = admin?.token || null;

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch platform analytics
      const analyticsRes = await fetch(
        `http://localhost:5000/api/admin/analytics?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const analyticsData = await analyticsRes.json();

      // Fetch revenue trends
      const trendsRes = await fetch(
        `http://localhost:5000/api/admin/analytics/revenue-trends?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const trendsData = await trendsRes.json();

      // Fetch shop stats
      const shopStatsRes = await fetch(
        `http://localhost:5000/api/admin/analytics/shop-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const shopStats = await shopStatsRes.json();

      if (analyticsData.success) {
        const revenueByMonth =
          trendsData.data?.map((trend) => ({
            month: trend.date,
            revenue: trend.platformRevenue,
          })) || [];

        setAnalyticsData({
          totalRevenue: analyticsData.data.revenue?.platform || 0,
          totalOrders: analyticsData.data.orders?.total || 0,
          averageOrderValue: analyticsData.data.revenue?.averageOrderValue || 0,
          topProducts: shopStats.data?.topShops || [],
          revenueByMonth:
            revenueByMonth.length > 0
              ? revenueByMonth
              : [{ month: "No Data", revenue: 0 }],
          orderStats: analyticsData.data.orders?.statusDistribution || {},
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-600 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">System performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaDollarSign}
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          subtitle="All time"
          color="bg-green-500"
        />
        <StatCard
          icon={FaShoppingCart}
          title="Total Orders"
          value={analyticsData.totalOrders.toLocaleString()}
          subtitle="All platforms"
          color="bg-blue-500"
        />
        <StatCard
          icon={FaChartLine}
          title="Avg Order Value"
          value={`₨${analyticsData.averageOrderValue.toFixed(2)}`}
          subtitle="Per order"
          color="bg-purple-500"
        />
        <StatCard
          icon={FaChartBar}
          title="System Health"
          value="98%"
          subtitle="Uptime"
          color="bg-indigo-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Revenue Trend
          </h2>
          <div className="space-y-4">
            {analyticsData.revenueByMonth.map((item) => (
              <div key={item.month}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {item.month}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    ${item.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (item.revenue /
                          Math.max(
                            ...analyticsData.revenueByMonth.map(
                              (m) => m.revenue,
                            ),
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-4">
            {Object.entries(analyticsData.orderStats).map(([status, count]) => (
              <div key={status} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {status}
                    </p>
                    <p className="text-sm font-bold text-gray-900">{count}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === "completed"
                          ? "bg-green-500"
                          : status === "pending"
                            ? "bg-yellow-500"
                            : status === "cancelled"
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }`}
                      style={{
                        width: `${
                          (count /
                            Object.values(analyticsData.orderStats).reduce(
                              (a, b) => a + b,
                              0,
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Shops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Top Shops by Revenue
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topProducts &&
              analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((shop, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {shop.shopName || "Unknown Shop"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shop.totalOrders}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${shop.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-600"
                  >
                    No shop data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
