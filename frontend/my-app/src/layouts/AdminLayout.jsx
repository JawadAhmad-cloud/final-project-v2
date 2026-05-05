import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaChartLine,
  FaStore,
  FaUsers,
  FaSignOutAlt,
  FaHome,
  FaCog,
} from "react-icons/fa";

export default function AdminLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: FaHome,
      label: "Dashboard",
    },
    {
      name: "Shops",
      path: "/admin/shops",
      icon: FaStore,
      label: "Shop Management",
    },
    {
      name: "Admin Management",
      path: "/admin/management",
      icon: FaUsers,
      label: "Manage Admins",
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: FaChartLine,
      label: "Analytics",
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: FaCog,
      label: "Settings",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-indigo-700 flex items-center justify-between">
          <h1 className={`${!sidebarOpen && "hidden"} text-xl font-bold`}>
            Admin Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-indigo-700 rounded-lg transition"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-200 hover:bg-indigo-700"
                }`}
              >
                <Icon className="text-lg" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <FaSignOutAlt className="text-lg" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-md p-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-200 rounded-lg lg:hidden"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
