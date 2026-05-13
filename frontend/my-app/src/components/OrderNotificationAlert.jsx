import React from "react";
import "./OrderNotificationAlert.css";

const OrderNotificationAlert = ({ order, onDismiss, onViewOrder }) => {
  return (
    <div className="order-notification-alert">
      <div className="order-alert-content">
        <div className="order-alert-icon">📦</div>
        <div className="order-alert-details">
          <h3 className="order-alert-title">New Order Received!</h3>
          <div className="order-alert-info">
            <p className="order-alert-amount">
              ৳{order.totalAmount || order.totalPrice}
            </p>
            <p className="order-alert-items">
              {order.itemCount || order.items?.length || 1} items
            </p>
          </div>
        </div>
      </div>
      <div className="order-alert-actions">
        <button className="order-alert-btn primary" onClick={onViewOrder}>
          View Order
        </button>
        <button className="order-alert-btn secondary" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default OrderNotificationAlert;
