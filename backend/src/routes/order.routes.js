const express = require("express");
const { validationResult } = require("express-validator");
const Order = require("../model/order.model");
const Payment = require("../model/payment.model");
const paymentService = require("../services/payment.service");
const tcsService = require("../services/tcs.service");
const invoiceService = require("../services/invoice.service");
const socketService = require("../services/socket.service");

const routes = express.Router();

/**
 * POST /
 * @description Create order from cart items
 * @param {Object} req.body - Order data
 * @param {Array} req.body.items - Cart items [{product, quantity}, ...]
 * @param {Object} req.body.shippingAddress - Delivery address
 * @returns {Object} {success: Boolean, data: {orderId}, message: String}
 * @middleware Authentication required
 */
routes.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress } = req.body;
    const io = req.app.get("io");

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address required",
      });
    }

    // Calculate total price
    let totalPrice = 0;
    let sellerId = null;

    for (const item of items) {
      const Product = require("../model/product.model");
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      totalPrice += product.price * item.quantity;

      // Get seller from first product
      if (!sellerId) {
        sellerId = product.seller;
      }
    }

    // Create order
    const order = new Order({
      user: userId,
      seller: sellerId,
      items,
      shippingAddress,
      totalPrice,
      totalAmount: totalPrice,
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Emit socket notification to seller if connected
    if (io && sellerId) {
      socketService.notifySellerNewOrder(io, sellerId, order);
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        totalPrice,
        message: "Order created successfully",
      },
      message: "Order created. Proceed to payment.",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /checkout
 * @description Create checkout session for order
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.post("/:orderId/checkout", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.sellerStatus == "pending" && order.status == "pending") {
      return res.status(404).json({
        success: false,
        message: "Order not accepted",
      });
    }

    // Create checkout session
    const result = await paymentService.createCheckout(orderId, {
      ...req.body,
      paymentMethod: paymentMethod || "card",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /payment/process
 * @description Process payment after checkout
 * @param {String} req.body.checkoutId - Checkout session ID
 * @param {String} req.body.cardNumber - Card number
 * @param {String} req.body.expiryDate - Card expiry date
 * @param {String} req.body.cvv - CVV
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.post("/payment/process", async (req, res) => {
  try {
    const { checkoutId, cardNumber, expiryDate, cvv } = req.body;

    if (!checkoutId || !cardNumber || !expiryDate || !cvv) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const result = await paymentService.processPayment(checkoutId, {
      cardNumber,
      expiryDate,
      cvv,
    });

    console.log(result);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /ship/:orderId
 * @description Ship order (seller action)
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.post("/ship/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { origin, destination, weight } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Can only ship paid orders
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Order payment must be completed before shipping",
      });
    }

    // Create TCS shipment
    const result = await tcsService.createShipment(orderId, {
      origin: origin || "Warehouse",
      destination: destination || order.shippingAddress.city,
      weight: weight || 1,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Shipping error:", error);
    res.status(500).json({
      success: false,
      message: "Shipping creation failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /tracking/:trackingNumber
 * @description Get shipment tracking status
 * @param {String} req.params.trackingNumber - TCS tracking number
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.get("/tracking/:trackingNumber", async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const result = await tcsService.getShipmentStatus(trackingNumber);

    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tracking status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /invoice/:orderId
 * @description Generate invoice for order
 * @param {String} req.params.orderId - Order ID
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.get("/invoice/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await invoiceService.generateInvoice(orderId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating invoice",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /invoice/html/:orderId
 * @description Download invoice as HTML
 * @param {String} req.params.orderId - Order ID
 * @returns {HTML} Invoice HTML document
 */
routes.get("/invoice/html/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await invoiceService.getInvoiceHTML(orderId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.setHeader("Content-Type", "text/html");
    res.send(result.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating invoice HTML",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /seller/:sellerId/revenue
 * @description Get seller revenue summary
 * @param {String} req.params.sellerId - Seller ID (Shop _id)
 * @returns {Object} {success: Boolean, data: Object, message: String}
 */
routes.get("/seller/:sellerId/revenue", async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get all paid orders for this seller
    const orders = await Order.find({
      seller: sellerId,
      paymentStatus: "paid",
    });

    const payments = await Payment.find({
      status: "paid",
    }).populate("orderId");

    // Calculate revenue from this seller's orders
    let totalRevenue = 0;
    let completedOrders = 0;

    payments.forEach((payment) => {
      const order = orders.find(
        (o) => o._id.toString() === payment.orderId._id.toString(),
      );
      if (order) {
        totalRevenue += payment.sellerAmount;
        if (order.status === "delivered") {
          completedOrders++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        completedOrders,
        totalOrders: orders.length,
        platformFeeDeducted: (
          orders.length *
          (paymentService.PLATFORM_FEE_PERCENT / 100)
        ).toFixed(2),
      },
      message: "Revenue summary retrieved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching revenue",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /seller/:sellerId/sales
 * @description Get seller sales and order details
 * @param {String} req.params.sellerId - Seller ID
 * @returns {Object} {success: Boolean, data: Array, message: String}
 */
routes.get("/seller/:sellerId/sales", async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({ seller: sellerId })
      .populate("buyer", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    const salesWithPayment = await Promise.all(
      orders.map(async (order) => {
        const payment = await Payment.findOne({ orderId: order._id });
        return {
          orderId: order._id,
          buyer: order.buyer.name,
          buyerEmail: order.buyer.email,
          items: order.items,
          totalAmount: order.totalPrice,
          platformFee: payment ? payment.platformFee : 0,
          sellerAmount: payment ? payment.sellerAmount : 0,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          shippingStatus: order.shipping?.status || "pending",
          trackingNumber: order.shipping?.trackingNumber,
          createdAt: order.createdAt,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: salesWithPayment,
      message: "Sales retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sales",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = routes;
