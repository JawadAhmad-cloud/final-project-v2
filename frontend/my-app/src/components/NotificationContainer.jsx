import React, { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import "./NotificationContainer.css";

const NotificationContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "#ecfdf5";
      case "error":
        return "#fef2f2";
      case "warning":
        return "#fffbeb";
      case "info":
        return "#eff6ff";
      default:
        return "#f9fafb";
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="notification"
          style={{
            borderLeft: `4px solid ${getColor(notification.type)}`,
            backgroundColor: getBgColor(notification.type),
          }}
        >
          <div className="notification-content">
            <span
              className="notification-icon"
              style={{ color: getColor(notification.type) }}
            >
              {getIcon(notification.type)}
            </span>
            <span
              className="notification-message"
              style={{ color: getColor(notification.type) }}
            >
              {notification.message}
            </span>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            style={{ color: getColor(notification.type) }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
