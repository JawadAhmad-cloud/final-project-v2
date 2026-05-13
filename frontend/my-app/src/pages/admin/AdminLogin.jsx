import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { AdminContext } from "../../context/AdminContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useContext(AdminContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const adminData = await adminLogin(formData);
      // Navigate based on role
      if (adminData.role === "seller") {
        navigate("/seller/orders");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-300">Enter your credentials to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-white bg-opacity-20 border border-indigo-500 border-opacity-50 rounded-lg px-4 py-3 focus-within:bg-opacity-30 focus-within:border-indigo-400 transition">
                <FaEnvelope className="text-indigo-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="flex items-center bg-white bg-opacity-20 border border-indigo-500 border-opacity-50 rounded-lg px-4 py-3 focus-within:bg-opacity-30 focus-within:border-indigo-400 transition">
                <FaLock className="text-indigo-400 mr-3" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white border-opacity-10">
            <p className="text-center text-gray-300 text-sm">
              This is the admin login portal.{" "}
              <span className="text-indigo-400 font-medium">
                Unauthorized access is prohibited.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
