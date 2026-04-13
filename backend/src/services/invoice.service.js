/**
 * Invoice Generation Service
 * Generates invoices for orders
 */

const Order = require("../model/order.model");
const Payment = require("../model/payment.model");
const Shop = require("../model/shop.model");
const User = require("../model/user.model");

// Generate invoice data (JSON format - can be converted to PDF)
async function generateInvoice(orderId) {
  try {
    const order = await Order.findById(orderId)
      .populate("buyer", "name email phone address")
      .populate("seller", "name email");

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    const payment = await Payment.findOne({ orderId });
    const shop = await Shop.findOne({ seller: order.seller });

    const invoice = {
      invoiceNumber: generateInvoiceNumber(orderId),
      invoiceDate: new Date().toLocaleDateString(),
      orderDate: new Date(order.createdAt).toLocaleDateString(),

      // Shop details
      shop: {
        name: shop.shopname,
        email: shop.contact.email,
        phone: shop.contact.phonenumber,
        address: `${shop.shopaddress.street}, ${shop.shopaddress.city}, ${shop.shopaddress.country}`,
        registrationNumber: generateRegistrationNumber(shop._id),
      },

      // Buyer details
      buyer: {
        name: order.buyer.name,
        email: order.buyer.email,
        phone: order.buyer.phone,
        address: order.buyer.address,
      },

      // Billing address (seller's address)
      billingAddress: {
        street: shop.buyingaddress.street,
        city: shop.buyingaddress.city,
        postalCode: shop.buyingaddress.postalcode,
        country: shop.buyingaddress.country,
      },

      // Order items
      items: order.items.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
      })),

      // Pricing breakdown
      subtotal: order.totalPrice,
      platformFee: payment ? payment.platformFee : 0,
      tax: 0, // Can be added based on region
      discount: 0,
      payableAmount: order.totalPrice,

      // Payment info
      payment: payment
        ? {
            method: payment.paymentMethod,
            status: payment.status,
            transactionId: payment.transactionId,
            paidAt: payment.paidAt ? payment.paidAt.toLocaleDateString() : null,
          }
        : null,

      // Shipping info
      shipping: {
        trackingNumber: order.shipping?.trackingNumber || "Pending",
        status: order.shipping?.status || "pending",
        estimatedDelivery: order.shipping?.estimatedDelivery
          ? new Date(order.shipping.estimatedDelivery).toLocaleDateString()
          : "N/A",
      },

      // Order status
      orderStatus: order.status,
      notes: `Thank you for your order! Track your shipment using tracking number: ${order.shipping?.trackingNumber || "Pending"}`,
    };

    return {
      success: true,
      data: invoice,
      message: "Invoice generated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// Generate invoice number
function generateInvoiceNumber(orderId) {
  return `INV-${new Date().getFullYear()}-${orderId.toString().slice(-6).toUpperCase()}`;
}

// Generate shop registration number (dummy)
function generateRegistrationNumber(shopId) {
  return `REG-${shopId.toString().slice(-8).toUpperCase()}`;
}

// Download invoice as HTML format
async function getInvoiceHTML(orderId) {
  try {
    const invoiceResult = await generateInvoice(orderId);

    if (!invoiceResult.success) {
      return invoiceResult;
    }

    const invoice = invoiceResult.data;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .invoice-container {
                max-width: 900px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 30px;
            }
            h1 { text-align: center; color: #2c3e50; }
            .invoice-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .section {
                margin-bottom: 20px;
            }
            .section-title {
                font-weight: bold;
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 5px;
                margin-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .total-row {
                font-weight: bold;
                background-color: #f9f9f9;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <h1>INVOICE</h1>
            
            <div class="invoice-header">
                <div>
                    <h3>${invoice.shop.name}</h3>
                    <p>${invoice.shop.address}</p>
                    <p>Email: ${invoice.shop.email}</p>
                    <p>Phone: ${invoice.shop.phone}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                    <p><strong>Invoice Date:</strong> ${invoice.invoiceDate}</p>
                    <p><strong>Order Date:</strong> ${invoice.orderDate}</p>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between;">
                <div class="section">
                    <div class="section-title">BILL TO</div>
                    <p><strong>${invoice.buyer.name}</strong></p>
                    <p>${invoice.buyer.address}</p>
                    <p>Email: ${invoice.buyer.email}</p>
                    <p>Phone: ${invoice.buyer.phone}</p>
                </div>
                <div class="section">
                    <div class="section-title">SHIP TO</div>
                    <p>${invoice.billingAddress.street}</p>
                    <p>${invoice.billingAddress.city}, ${invoice.billingAddress.postalCode}</p>
                    <p>${invoice.billingAddress.country}</p>
                </div>
            </div>

            <div class="section">
                <div class="section-title">ORDER ITEMS</div>
                <table>
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items
                          .map(
                            (item) => `
                        <tr>
                            <td>${item.productId}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.unitPrice.toFixed(2)}</td>
                            <td>$${item.totalPrice.toFixed(2)}</td>
                        </tr>
                        `,
                          )
                          .join("")}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Subtotal:</td>
                            <td>$${invoice.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right;">Platform Fee (10%):</td>
                            <td>-$${invoice.platformFee.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total Amount:</td>
                            <td>$${invoice.payableAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style="display: flex; justify-content: space-between;">
                <div class="section">
                    <div class="section-title">PAYMENT INFO</div>
                    <p><strong>Method:</strong> ${invoice.payment?.method || "Pending"}</p>
                    <p><strong>Status:</strong> ${invoice.payment?.status.toUpperCase() || "PENDING"}</p>
                    <p><strong>Transaction ID:</strong> ${invoice.payment?.transactionId || "N/A"}</p>
                    <p><strong>Paid Date:</strong> ${invoice.payment?.paidAt || "Not Paid"}</p>
                </div>
                <div class="section">
                    <div class="section-title">SHIPPING INFO</div>
                    <p><strong>Tracking #:</strong> ${invoice.shipping.trackingNumber}</p>
                    <p><strong>Status:</strong> ${invoice.shipping.status.toUpperCase()}</p>
                    <p><strong>Est. Delivery:</strong> ${invoice.shipping.estimatedDelivery}</p>
                </div>
            </div>

            <div class="footer">
                <p>${invoice.notes}</p>
                <p style="margin-top: 20px;">Thank you for your business!</p>
                <p>This is an electronically generated invoice and is valid without a signature.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return {
      success: true,
      data: html,
      message: "Invoice HTML generated",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = {
  generateInvoice,
  getInvoiceHTML,
};
