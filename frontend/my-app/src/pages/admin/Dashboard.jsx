import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStore,
  FaUser,
  FaDollarSign,
  FaBox,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalShops: 0,
    pendingShops: 0,
    verifiedShops: 0,
    rejectedShops: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const storedAdmin = sessionStorage.getItem("admin");
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
  const token = admin?.token || null;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch pending shops
      const shopsRes = await fetch(
        "http://localhost:5000/api/admin/shops/pending?page=1&limit=5",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const shopsData = await shopsRes.json();

      // Fetch all shops for summary
      const allShopsRes = await fetch(
        "http://localhost:5000/api/admin/shops?page=1&limit=1000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const allShopsData = await allShopsRes.json();

      // Fetch admins
      const adminsRes = await fetch(
        "http://localhost:5000/api/admin/management/all-admins?page=1&limit=1000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const adminsData = await adminsRes.json();

      // Process stats - handling correct response structure
      const allShops = allShopsData?.data?.shops || [];
      const pendingCount = Array.isArray(allShops)
        ? allShops.filter((s) => s.isverified === "pending").length
        : 0;
      const verifiedCount = Array.isArray(allShops)
        ? allShops.filter((s) => s.isverified === "verified").length
        : 0;
      const rejectedCount = Array.isArray(allShops)
        ? allShops.filter((s) => s.isverified === "rejected").length
        : 0;
      const pendingActivityShops = shopsData?.data?.shops || [];

      setStats({
        totalShops: allShopsData?.data?.pagination?.total || 0,
        pendingShops: pendingCount,
        verifiedShops: verifiedCount,
        rejectedShops: rejectedCount,
        totalAdmins: adminsData?.data?.pagination?.total || 0,
        totalProducts: 0,
        totalRevenue: 0,
        recentActivity: pendingActivityShops,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
      <div className={`${color} p-4 rounded-lg`}>
        <Icon className="text-2xl text-white" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your system overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaStore}
          title="Total Shops"
          value={stats.totalShops}
          color="bg-blue-500"
        />
        <StatCard
          icon={FaExclamationCircle}
          title="Pending Verification"
          value={stats.pendingShops}
          color="bg-yellow-500"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Verified Shops"
          value={stats.verifiedShops}
          color="bg-green-500"
        />
        <StatCard
          icon={FaUser}
          title="Admin Users"
          value={stats.totalAdmins}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Pending Shops */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Pending Shops
          </h2>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((shop) => (
                <div
                  key={shop.shopId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{shop.shopname}</p>
                    <p className="text-sm text-gray-600">{shop.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pending shops</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">Verification Rate</p>
                <p className="font-bold text-gray-900">
                  {stats.totalShops > 0
                    ? Math.round((stats.verifiedShops / stats.totalShops) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.totalShops > 0
                        ? (stats.verifiedShops / stats.totalShops) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Quick Actions</p>
              <button
                onClick={() => navigate("/admin/shops")}
                className="w-full py-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                View Pending Shops
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
