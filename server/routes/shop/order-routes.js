const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getSellerAnalytics,
} = require("../../controllers/shop/order-controller");
const { attachUser, verifySellerAdmin } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/create", attachUser, createOrder);
router.get("/list/:userId", attachUser, getAllOrdersByUser);
router.get("/details/:id", attachUser, getOrderDetails);
router.get("/admin/list", verifySellerAdmin, getAllOrdersForAdmin);
router.put("/admin/update/:id", verifySellerAdmin, updateOrderStatus);
router.put("/:id/status", verifySellerAdmin, updateOrderStatus);
router.get("/admin/analytics", verifySellerAdmin, getSellerAnalytics);

module.exports = router;
