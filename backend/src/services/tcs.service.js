/**
 * Dummy TCS (Shipping) Service
 * Simulates real shipping service for final year project
 */

const Order = require("../model/order.model");

// Simulate TCS API response
async function createShipment(orderId, shipmentData) {
  try {
    const trackingNumber = generateTrackingNumber();

    const shipment = {
      trackingNumber,
      orderId,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      weight: shipmentData.weight || 1,
      status: "pending",
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 60000), // 5 days
      //estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    };

    // In real scenario, this would be saved to a database
    // For now, we'll store it in the order itself
    await Order.findByIdAndUpdate(orderId, {
      "shipping.trackingNumber": trackingNumber,
      "shipping.status": "in_transit",
      status: "shipped",
      "shipping.estimatedDelivery": shipment.estimatedDelivery,
    });

    return {
      success: true,
      data: shipment,
      message: "Shipment created successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

// Get shipment status
async function getShipmentStatus(trackingNumber) {
  try {
    const order = await Order.findOne({
      "shipping.trackingNumber": trackingNumber,
    });

    if (!order) {
      return {
        success: false,
        data: null,
        message: "Shipment not found",
      };
    }

    // Simulate delivery after some time
    const createdTime = new Date(order.shipping.createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedHours = (currentTime - createdTime) / (1000 * 60 * 60);

    let status = "in_transit";
    if (elapsedHours > 4) {
      status = "delivered";
      await Order.findByIdAndUpdate(order._id, {
        "shipping.status": "delivered",
        status: "delivered",
        "shipping.deliveredAt": new Date(),
      });
    }

    return {
      success: true,
      data: {
        trackingNumber,
        status,
        estimatedDelivery: order.shipping.estimatedDelivery,
        currentLocation: status === "delivered" ? "Delivered" : "In Transit",
      },
      message: "Shipment status retrieved",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

// Generate unique tracking number
function generateTrackingNumber() {
  return `TCS${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

module.exports = {
  createShipment,
  getShipmentStatus,
  generateTrackingNumber,
};
