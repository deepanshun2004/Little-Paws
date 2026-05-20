const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");
const { attachUser } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/add", attachUser, addToCart);
router.get("/get/:userId", attachUser, fetchCartItems);
router.put("/update-cart", attachUser, updateCartItemQty);
router.delete("/:userId/:productId", attachUser, deleteCartItem);

module.exports = router;
