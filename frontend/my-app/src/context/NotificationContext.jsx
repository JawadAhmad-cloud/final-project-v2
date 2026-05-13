import React, { createContext, useState, useCallback } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Date.now();
      const notification = {
        id,
        message,
        type, // 'success', 'error', 'warning', 'info'
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration) => showNotification(message, "success", duration),
    [showNotification],
  );

  const showError = useCallback(
    (message, duration) => showNotification(message, "error", duration),
    [showNotification],
  );

  const showWarning = useCallback(
    (message, duration) => showNotification(message, "warning", duration),
    [showNotification],
  );

  const showInfo = useCallback(
    (message, duration) => showNotification(message, "info", duration),
    [showNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
        notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
