const express = require("express");
const { attachUser } = require("../../middlewares/auth.middleware");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../../controllers/shop/payment-controller");

const router = express.Router();

router.post("/create-order", attachUser, createRazorpayOrder);
router.post("/verify", attachUser, verifyRazorpayPayment);

module.exports = router;
