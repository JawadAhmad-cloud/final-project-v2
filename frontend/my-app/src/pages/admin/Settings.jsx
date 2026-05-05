import { useState, useEffect } from "react";
import { FaSave, FaBell, FaLock, FaDatabase } from "react-icons/fa";

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      shopVerification: true,
      systemAlerts: true,
      adminChanges: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
    system: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireEmailVerification: true,
    },
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const json = await response.json();
      if (json.success && json.data.settings) {
        setSettings(json.data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category, setting) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  const handleInputChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const json = await response.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="text-2xl text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const ToggleSetting = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
            value ? "translate-x-6" : ""
          }`}
        ></div>
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage system configuration and preferences
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
          Loading settings...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Notification Settings */}
      <SettingSection icon={FaBell} title="Notification Settings">
        <div className="space-y-1">
          <ToggleSetting
            label="Email Alerts"
            description="Receive email notifications for important events"
            value={settings.notifications.emailAlerts}
            onChange={() => handleToggle("notifications", "emailAlerts")}
          />
          <ToggleSetting
            label="Shop Verification Alerts"
            description="Get notified when new shops need verification"
            value={settings.notifications.shopVerification}
            onChange={() => handleToggle("notifications", "shopVerification")}
          />
          <ToggleSetting
            label="System Alerts"
            description="Receive alerts for system issues and maintenance"
            value={settings.notifications.systemAlerts}
            onChange={() => handleToggle("notifications", "systemAlerts")}
          />
          <ToggleSetting
            label="Admin Changes"
            description="Get notified when admin accounts are modified"
            value={settings.notifications.adminChanges}
            onChange={() => handleToggle("notifications", "adminChanges")}
          />
        </div>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection icon={FaLock} title="Security Settings">
        <div className="space-y-4">
          <ToggleSetting
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.security.twoFactor}
            onChange={() => handleToggle("security", "twoFactor")}
          />
          <div className="py-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) =>
                handleInputChange("security", "sessionTimeout", e.target.value)
              }
              min="15"
              max="480"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <p className="text-xs text-gray-600 mt-1">
              Sessions will automatically expire after this time period
            </p>
          </div>
        </div>
      </SettingSection>

      {/* System Settings */}
      <SettingSection icon={FaDatabase} title="System Settings">
        <div className="space-y-1">
          <ToggleSetting
            label="Maintenance Mode"
            description="Put the system in maintenance mode to prevent user access"
            value={settings.system.maintenanceMode}
            onChange={() => handleToggle("system", "maintenanceMode")}
          />
          <ToggleSetting
            label="Allow New Registrations"
            description="Allow users to create new accounts"
            value={settings.system.allowNewRegistrations}
            onChange={() => handleToggle("system", "allowNewRegistrations")}
          />
          <ToggleSetting
            label="Require Email Verification"
            description="Require users to verify email before registration is complete"
            value={settings.system.requireEmailVerification}
            onChange={() => handleToggle("system", "requireEmailVerification")}
          />
        </div>
      </SettingSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">System Version</p>
            <p className="font-medium text-gray-900">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">API Version</p>
            <p className="font-medium text-gray-900">v1</p>
          </div>
          <div>
            <p className="text-gray-600">Database</p>
            <p className="font-medium text-gray-900">MongoDB</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium text-green-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
