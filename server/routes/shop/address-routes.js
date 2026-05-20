const express = require("express");

const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");
const { attachUser } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/add", attachUser, addAddress);
router.get("/get/:userId", attachUser, fetchAllAddress);
router.delete("/delete/:userId/:addressId", attachUser, deleteAddress);
router.put("/update/:userId/:addressId", attachUser, editAddress);

module.exports = router;
