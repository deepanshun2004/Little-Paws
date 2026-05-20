const express = require("express");
const { attachUser } = require("../middlewares/auth.middleware");
const {
  getContacts,
  createOrGetChat,
  getChatById,
  sendMessage,
} = require("../controllers/chat.controller");

const router = express.Router();

router.get("/contacts", attachUser, getContacts);
router.post("/create", attachUser, createOrGetChat);
router.post("/with-user", attachUser, createOrGetChat);
router.get("/:chatId", attachUser, getChatById);
router.post("/message", attachUser, sendMessage);
router.post("/messages", attachUser, sendMessage);

module.exports = router;
