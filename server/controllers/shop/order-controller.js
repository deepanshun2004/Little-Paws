const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Payment = require("../../models/Payment");
const { createNotification } = require("../../helpers/notifications");
const { emitToRole, emitToUser } = require("../../socket");
const { sendOrderEmail } = require("../../utils/sendEmail");

const ORDER_STATUS_FLOW = ["confirmed", "shipped", "out_for_delivery", "delivered"];
const ORDER_NOTIFICATION_MAP = {
  confirmed: "Your order has been confirmed",
  shipped: "Your order has been shipped",
  out_for_delivery: "Your order is out for delivery",
  delivered: "Order delivered successfully",
};

const normalizeDateTime = (value) => {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

async function syncPaymentStatus(order, nextPaymentStatus) {
  order.paymentStatus = nextPaymentStatus;
  const payment = await Payment.findOne({ orderId: order._id });
  if (payment) {
    payment.status = nextPaymentStatus;
    await payment.save();
  }
}

async function buildOrderResponse(order) {
  return {
    ...order,
    user: order.userId ? await User.findById(order.userId) : null,
    payment: await Payment.findOne({ orderId: order._id }),
  };
}

async function emitOrderEvent(eventName, order) {
  const payload = await buildOrderResponse(order);
  emitToUser(order.userId, eventName, payload);
  emitToRole("sellerAdmin", eventName, payload);
  return payload;
}

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
      paymentMethod,
      mockPaymentStatus,
      paymentId,
    } = req.body;

    if (!userId || !cartItems?.length || !addressInfo?.address || !addressInfo?.city) {
      return res.status(400).json({
        success: false,
        message: "Invalid order payload",
      });
    }

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for cart item ${item.productId}`,
        });
      }

      if (Number(product.totalStock) < Number(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.title}`,
        });
      }
    }

    const resolvedPaymentMethod = paymentMethod === "online" ? "online" : "cod";
    const resolvedPaymentStatus =
      resolvedPaymentMethod === "online"
        ? ["paid", "failed"].includes(mockPaymentStatus)
          ? mockPaymentStatus
          : "pending"
        : "pending";

    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "confirmed",
      trackingStatus: "confirmed",
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: resolvedPaymentStatus,
      paymentReference:
        resolvedPaymentMethod === "online" ? (paymentId || `MOCK-${Date.now()}`) : `COD-${Date.now()}`,
      totalAmount,
      orderDate: normalizeDateTime(orderDate),
      orderUpdateDate: normalizeDateTime(orderUpdateDate),
      paymentId: paymentId || "not-required",
      payerId: "not-required",
    });

    await newlyCreatedOrder.save();

    const payment = new Payment({
      orderId: newlyCreatedOrder._id,
      userId,
      method: resolvedPaymentMethod,
      status: resolvedPaymentStatus,
      amount: totalAmount,
      reference: newlyCreatedOrder.paymentReference,
    });
    await payment.save();

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      product.totalStock = Number(product.totalStock) - Number(item.quantity);
      product.availability = Number(product.totalStock) > 0 ? "in_stock" : "out_of_stock";
      await product.save();
    }

    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    }

    await createNotification({
      userId,
      title: "Order confirmed",
      message: ORDER_NOTIFICATION_MAP.confirmed,
      type: "order",
      entityId: newlyCreatedOrder._id,
    });

    const user = await User.findById(userId);
    if (user) {
      sendOrderEmail(user.email, user.userName, newlyCreatedOrder._id).catch(err => console.error("Order email failed:", err));
    }

    const responseData = await emitOrderEvent("order:created", newlyCreatedOrder);

    res.status(201).json({
      success: true,
      orderId: newlyCreatedOrder._id,
      message: "Order placed successfully",
      data: responseData,
    });
  } catch (e) {
    console.log("createOrder error:", e);
    res.status(500).json({
      success: false,
      message: e.message || "Some error occurred!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });

    res.status(200).json({
      success: true,
      data: await Promise.all(
        orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(buildOrderResponse)
      ),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({
      success: true,
      data: await Promise.all(
        orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(buildOrderResponse)
      ),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: await buildOrderResponse(order),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (orderStatus && !ORDER_STATUS_FLOW.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.trackingStatus = orderStatus;
    }
    if (paymentStatus) {
      await syncPaymentStatus(order, paymentStatus);
    }

    if (order.orderStatus === "delivered" && order.paymentMethod === "cod") {
      await syncPaymentStatus(order, "paid");
    }
    order.orderUpdateDate = new Date();
    await order.save();

    await createNotification({
      userId: order.userId,
      title: "Order updated",
      message: ORDER_NOTIFICATION_MAP[order.orderStatus] || `Order #${order._id} is now ${order.orderStatus}.`,
      type: "order",
      entityId: order._id,
    });

    const responseData = await emitOrderEvent("order:updated", order);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: responseData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getSellerAnalytics = async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find({});
    const paidOrPending = orders.filter((order) => order.paymentStatus !== "failed");
    const totalRevenue = paidOrPending.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const productSalesMap = new Map();

    orders.forEach((order) => {
      (order.cartItems || []).forEach((item) => {
        const existing = productSalesMap.get(String(item.productId)) || {
          productId: item.productId,
          title: item.title,
          sold: 0,
        };
        existing.sold += Number(item.quantity || 0);
        productSalesMap.set(String(item.productId), existing);
      });
    });

    const customers = new Map();
    await Promise.all(
      orders.map(async (order) => {
        if (!order.userId || customers.has(String(order.userId))) {
          return;
        }
        const user = await User.findById(order.userId);
        if (user) {
          customers.set(String(order.userId), user);
        }
      })
    );

    const payments = await Payment.find();

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders: orders.length,
        topProducts: Array.from(productSalesMap.values()).sort((a, b) => b.sold - a.sold).slice(0, 5),
        totalProducts: products.length,
      },
      customers: Array.from(customers.values()),
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to fetch analytics" });
  }
};

module.exports = {
  createOrder,
  getAllOrdersByUser,
  getAllOrdersForAdmin,
  getOrderDetails,
  updateOrderStatus,
  getSellerAnalytics,
};
