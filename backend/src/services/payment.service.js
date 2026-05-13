/**
 * Dummy Payment Service
 * Simulates payment gateway for final year project
 * Handles checkout and payment processing
 */

const Payment = require("../model/payment.model");
const Order = require("../model/order.model");
const Shop = require("../model/shop.model");

// Platform fee percentage
const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

// Create checkout session
async function createCheckout(orderId, paymentData) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Calculate total and platform fee
    const subtotal = order.totalPrice;
    const platformFee = (subtotal * PLATFORM_FEE_PERCENT) / 100;
    const sellerAmount = subtotal - platformFee;

    const payment = new Payment({
      orderId,
      amount: subtotal,
      platformFee,
      sellerAmount,
      status: "pending",
      paymentMethod: paymentData.paymentMethod || "card",
      checkoutData: {
        cardName: paymentData.cardName,
        // NOTE: Card number is NOT stored for security purposes
        expiryDate: paymentData.expiryDate,
        // NOTE: CVV is never stored in real scenarios
      },
    });

    await payment.save();

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      status: "pending_payment",
      "payment.checkoutSessionId": payment._id,
    });

    return {
      success: true,
      data: {
        checkoutId: payment._id,
        amount: subtotal,
        platformFee,
        sellerAmount,
        paymentMethod: paymentData.paymentMethod,
      },
      message: "Checkout session created",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Process payment (dummy - auto approves)
async function processPayment(checkoutId, verificationData, io = null) {
  try {
    const payment = await Payment.findById(checkoutId);
    if (!payment) {
      return { success: false, message: "Payment not found" };
    }

    // Simulate payment processing
    // In real scenario: call actual payment gateway
    const isValid = validatePaymentData(
      verificationData.cardNumber,
      verificationData.expiryDate,
      verificationData.cvv,
    );

    if (!isValid) {
      return { success: false, message: "Invalid payment details" };
    }

    // Update payment status
    payment.status = "paid";
    payment.paidAt = new Date();
    payment.transactionId = generateTransactionId();
    await payment.save();

    // Get order with items
    const order = await Order.findById(payment.orderId).populate(
      "items.product",
    );
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Update inventory for each ordered item
    const Product = require("../model/product.model");
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        // Update reserved and available stock
        product.reservedStock = (product.reservedStock || 0) + item.quantity;
        product.availableStock = product.totalStock - product.reservedStock;
        await product.save();
      }
    }

    // Update order status
    await Order.findByIdAndUpdate(payment.orderId, {
      status: "paid",
      paymentStatus: "paid",
      "payment.status": "paid",
      "payment.transactionId": payment.transactionId,
    });

    // Get updated order for notification
    const updatedOrder = await Order.findById(payment.orderId);

    // Emit socket notification to seller about payment completion
    if (io && updatedOrder) {
      const Shop = require("../model/shop.model");
      const shop = await Shop.findById(updatedOrder.seller);
      if (shop && shop.seller) {
        const socketService = require("./socket.service");
        socketService.notifySellerOrderUpdate(
          io,
          shop.seller,
          updatedOrder,
          "paid",
        );
      }
    }

    // Process payment to seller - Add revenue to seller account
    const revenueResult = await addSellerRevenue(
      order.seller,
      payment.sellerAmount,
      payment._id,
    );

    if (!revenueResult.success) {
      console.warn(
        `Warning: Failed to add revenue to seller ${order.seller} for payment ${payment._id}`,
      );
      // Continue processing despite revenue tracking failure
    }

    return {
      success: true,
      data: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: "paid",
        message: "Payment processed successfully",
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Add revenue to seller
async function addSellerRevenue(sellerId, amount, paymentId) {
  try {
    // sellerId here is the shop id stored on the product/order, not the seller user id
    const shop =
      (await Shop.findById(sellerId)) ||
      (await Shop.findOne({ seller: sellerId }));
    if (!shop) return { success: false, message: "Shop not found" };

    // Update shop revenue
    shop.totalRevenue = (shop.totalRevenue || 0) + amount;
    shop.earnings = (shop.earnings || 0) + amount;

    // Add transaction record
    if (!shop.transactions) {
      shop.transactions = [];
    }

    shop.transactions.push({
      type: "payment",
      amount,
      date: new Date(),
      paymentId,
      description: `Payment received for order`,
    });

    await shop.save();

    return { success: true };
  } catch (error) {
    console.error("Error adding seller revenue:", error);
    return { success: false };
  }
}

// Get payment details
async function getPayment(paymentId) {
  try {
    const payment = await Payment.findById(paymentId).populate("orderId");
    if (!payment) {
      return { success: false, message: "Payment not found" };
    }

    return {
      success: true,
      data: {
        _id: payment._id,
        orderId: payment.orderId._id,
        amount: payment.amount,
        platformFee: payment.platformFee,
        sellerAmount: payment.sellerAmount,
        status: payment.status,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        checkoutData: payment.checkoutData,
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Validate payment data (dummy validation)
function validatePaymentData(cardNumber, expiryDate, cvv) {
  // In real scenario: call payment gateway for validation
  // For dummy: just check if valid format
  return (
    cardNumber &&
    cardNumber.length >= 13 &&
    expiryDate &&
    cvv &&
    cvv.length >= 3
  );
}

// Mask card number for security
function maskCardNumber(cardNumber) {
  if (!cardNumber) return "";
  return `****-****-****-${cardNumber.slice(-4)}`;
}

// Generate transaction ID
function generateTransactionId() {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

module.exports = {
  createCheckout,
  processPayment,
  getPayment,
  addSellerRevenue,
  PLATFORM_FEE_PERCENT,
};
