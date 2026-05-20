const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  toggleWishlist,
  getWishlist,
} = require("../../controllers/shop/products-controller");
const { verifySellerAdmin, attachUser } = require("../../middlewares/auth.middleware");
const { upload } = require("../../helpers/upload");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.post("/create", verifySellerAdmin, upload.single("image"), createProduct);
router.put("/update/:id", verifySellerAdmin, upload.single("image"), updateProduct);
router.delete("/delete/:id", verifySellerAdmin, deleteProduct);
router.post("/review/:id", attachUser, addReview);
router.post("/wishlist/toggle", attachUser, toggleWishlist);
router.get("/wishlist/:userId", attachUser, getWishlist);

module.exports = router;
