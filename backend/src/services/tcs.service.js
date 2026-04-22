/**
 * Dummy TCS (Shipping) Service
 * Simulates real shipping service for final year project
 */

const Order = require("../model/order.model");
const Payment = require("../model/payment.model");
const Shop = require("../model/shop.model");

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
      estimatedDelivery: new Date(Date.now() + 60000), // 1 minute for testing
      //estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days original
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
    const elapsedMinutes = (currentTime - createdTime) / (1000 * 60); // Changed to minutes

    let status = "in_transit";
    if (elapsedMinutes > 1) {
      // 1 minute for testing (was 4 hours)
      status = "delivered";
      await Order.findByIdAndUpdate(order._id, {
        "shipping.status": "delivered",
        status: "delivered",
        "shipping.deliveredAt": new Date(),
      });

      // Distribute payment to seller when order is delivered
      await distributePaymentToSeller(order._id);
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

// Distribute payment to seller when order is delivered
async function distributePaymentToSeller(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    // Find the payment associated with this order
    const payment = await Payment.findOne({ orderId });
    if (!payment) return;

    // Only distribute if payment is already paid but not yet distributed
    if (payment.status !== "paid" || payment.distributedToSeller) {
      return;
    }

    // Calculate platform fee and seller amount
    const PLATFORM_FEE_PERCENT = 10; // 10% platform fee
    const platformFee = (payment.amount * PLATFORM_FEE_PERCENT) / 100;
    const sellerAmount = payment.amount - platformFee;

    // Add revenue to seller's shop
    const shop = await Shop.findOne({ seller: order.seller });
    if (shop) {
      shop.totalRevenue = (shop.totalRevenue || 0) + sellerAmount;
      shop.earnings = (shop.earnings || 0) + sellerAmount;

      // Add transaction record
      if (!shop.transactions) {
        shop.transactions = [];
      }

      shop.transactions.push({
        type: "delivery_payment",
        amount: sellerAmount,
        date: new Date(),
        paymentId: payment._id,
        description: `Payment released on delivery for order ${orderId}`,
      });

      await shop.save();
    }

    // Mark payment as distributed to seller
    payment.distributedToSeller = true;
    payment.distributedAt = new Date();
    payment.sellerAmount = sellerAmount;
    payment.platformFee = platformFee;
    await payment.save();
  } catch (error) {
    console.error("Error distributing payment to seller:", error);
    // Don't throw error, just log it
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
