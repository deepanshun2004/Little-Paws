const Razorpay = require("razorpay");
const crypto = require("crypto");

const createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Total amount is required",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_ID.includes("YOUR_RAZORPAY")) {
      console.error("Razorpay Error: Missing or invalid API keys in .env file");
      return res.status(500).json({
        success: false,
        message: "Razorpay API keys are not configured correctly in the backend. Please update your .env file.",
      });
    }

    console.log(`[Razorpay] Creating order for amount: ${totalAmount} INR`);

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: Math.round(totalAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Send public key to frontend
    });
  } catch (error) {
    console.error("====== Razorpay Create Order Error ======");
    console.error("Error Message:", error.message);
    console.error("Error Details:", error);
    console.error("=========================================");
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    console.log("[Razorpay] Verifying payment signature...", req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature sent!",
      });
    }
  } catch (error) {
    console.error("====== Razorpay Verify Error ======");
    console.error("Error Message:", error.message);
    console.error("Error Details:", error);
    console.error("===================================");
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify Razorpay payment",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
