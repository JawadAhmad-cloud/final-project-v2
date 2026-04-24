/**
 * Agenda Scheduler Service
 * Handles automatic order status updates based on delivery time
 */

const Agenda = require("agenda");
const Order = require("../model/order.model");
const Shop = require("../model/shop.model");
const Payment = require("../model/payment.model");

let agenda = null;

// Initialize agenda with MongoDB connection
async function initializeAgenda(mongoUri) {
  try {
    agenda = new Agenda({
      db: {
        address: mongoUri,
        collection: "agendaJobs",
      },
      processEvery: "30 seconds", // Check every 30 seconds for jobs to run
    });

    // Define job for updating order to delivered
    agenda.define("update_order_to_delivered", async (job) => {
      try {
        const { orderId } = job.attrs.data;

        const order = await Order.findById(orderId);
        if (!order) {
          console.log(`Order ${orderId} not found for delivery update`);
          return;
        }

        // Update order status to delivered
        order.status = "delivered";
        if (order.shipping) {
          order.shipping.status = "delivered";
          order.shipping.deliveredAt = new Date();
        }
        await order.save();

        console.log(
          `Order ${orderId} automatically updated to delivered status`,
        );

        // Distribute payment to seller when order is delivered
        await distributePaymentToSeller(orderId);

        job.remove();
      } catch (error) {
        console.error("Error updating order to delivered:", error);
        // Don't remove job on error - let it retry
      }
    });

    // Start agenda
    await agenda.start();
    console.log("Agenda scheduler initialized successfully");
  } catch (error) {
    console.error("Error initializing agenda:", error);
    throw error;
  }
}

// Schedule order delivery update
async function scheduleOrderDelivery(orderId, deliveryTime) {
  try {
    if (!agenda) {
      throw new Error("Agenda not initialized");
    }

    // Remove any existing job for this order
    await agenda.cancel({
      "data.orderId": orderId,
      name: "update_order_to_delivered",
    });

    // Schedule new job
    const job = agenda.schedule(deliveryTime, "update_order_to_delivered", {
      orderId,
    });

    await job.save();

    console.log(
      `Scheduled delivery update for order ${orderId} at ${deliveryTime.toISOString()}`,
    );
    return {
      success: true,
      message: `Order delivery scheduled for ${deliveryTime.toISOString()}`,
    };
  } catch (error) {
    console.error("Error scheduling order delivery:", error);
    return {
      success: false,
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

    console.log(`Payment distributed to seller for order ${orderId}`);
  } catch (error) {
    console.error("Error distributing payment:", error);
  }
}

// Get agenda instance
function getAgenda() {
  return agenda;
}

// Gracefully stop agenda
async function stopAgenda() {
  if (agenda) {
    await agenda.stop();
    console.log("Agenda scheduler stopped");
  }
}

module.exports = {
  initializeAgenda,
  scheduleOrderDelivery,
  getAgenda,
  stopAgenda,
};
