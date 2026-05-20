const express = require("express");
const { attachUser } = require("../middlewares/auth.middleware");
const {
  getNotifications,
  markNotificationRead,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", attachUser, getNotifications);
router.put("/read", attachUser, markNotificationRead);

module.exports = router;
