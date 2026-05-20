const express = require("express");
const { verifySellerAdmin, attachUser } = require("../middlewares/auth.middleware");
const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  updateOrderStatus,
} = require("../controllers/shop/order-controller");

const router = express.Router();

router.post("/", attachUser, createOrder);
router.get("/user/:userId", attachUser, getAllOrdersByUser);
router.get("/:id", attachUser, getOrderDetails);
router.put("/:id/status", verifySellerAdmin, updateOrderStatus);

module.exports = router;
