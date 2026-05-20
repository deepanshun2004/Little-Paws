const Chat = require("../models/Chat");
const User = require("../models/User");
const Shelter = require("../models/shelter.model");
const { createNotification } = require("../helpers/notifications");
const { getIo } = require("../socket");

const normalizeRole = (role) => {
  if (role === "sellerAdmin") return "seller";
  if (role === "shelterAdmin") return "shelter";
  return role;
};

function sortParticipants(participants) {
  return [...participants].map(String).sort((a, b) => Number(a) - Number(b));
}

async function findChatBetween(userId, otherUserId) {
  const chats = await Chat.find({});
  const participants = sortParticipants([userId, otherUserId]);
  return (
    chats.find((chat) => {
      const currentParticipants = sortParticipants(chat.participants || []);
      return JSON.stringify(currentParticipants) === JSON.stringify(participants);
    }) || null
  );
}

async function validateChatAccess(currentUser, otherUserId) {
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    return { valid: false, message: "Other user not found" };
  }

  const currentRole = normalizeRole(currentUser.role);
  const otherRole = normalizeRole(otherUser.role);

  const allowed =
    (currentRole === "user" && ["seller", "shelter"].includes(otherRole)) ||
    (otherRole === "user" && ["seller", "shelter"].includes(currentRole));

  if (!allowed) {
    return { valid: false, message: "Unauthorized chat access" };
  }

  return { valid: true, otherUser };
}

async function enrichContact(user) {
  if (normalizeRole(user.role) !== "shelter") {
    return user;
  }

  const shelter = await Shelter.findOne({ shelterAdmin: user._id });
  return {
    ...user,
    shelter,
  };
}

const getContacts = async (req, res) => {
  try {
    const users = await User.find({});
    const currentRole = normalizeRole(req.user.role);

    const filteredContacts = users.filter((user) => {
      if (String(user._id) === String(req.user.id)) {
        return false;
      }

      const userRole = normalizeRole(user.role);
      if (currentRole === "user") {
        return ["seller", "shelter"].includes(userRole);
      }

      return userRole === "user";
    });

    const contacts = await Promise.all(filteredContacts.map(enrichContact));
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch contacts" });
  }
};

const createOrGetChat = async (req, res) => {
  try {
    const otherUserId = req.body.userId || req.params.userId;
    if (!otherUserId) {
      return res.status(400).json({ success: false, message: "Other user is required" });
    }

    const validation = await validateChatAccess(req.user, otherUserId);
    if (!validation.valid) {
      return res.status(403).json({ success: false, message: validation.message });
    }

    let chat = await findChatBetween(req.user.id, otherUserId);
    if (!chat) {
      chat = new Chat({
        participants: sortParticipants([req.user.id, otherUserId]),
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to initialize chat" });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    if (!(chat.participants || []).map(String).includes(String(req.user.id))) {
      return res.status(403).json({ success: false, message: "Unauthorized chat access" });
    }

    res.status(200).json({
      success: true,
      data: chat,
      messages: (chat.messages || []).sort(
        (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
      ),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch chat" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, receiverId, text } = req.body;
    if (!String(text || "").trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    let chat = null;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else if (receiverId) {
      const validation = await validateChatAccess(req.user, receiverId);
      if (!validation.valid) {
        return res.status(403).json({ success: false, message: validation.message });
      }
      chat = await findChatBetween(req.user.id, receiverId);
      if (!chat) {
        chat = new Chat({
          participants: sortParticipants([req.user.id, receiverId]),
          messages: [],
        });
      }
    }

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    if (!(chat.participants || []).map(String).includes(String(req.user.id))) {
      return res.status(403).json({ success: false, message: "Unauthorized chat access" });
    }

    const otherParticipantId = (chat.participants || []).find(
      (participant) => String(participant) !== String(req.user.id)
    );
    const validation = await validateChatAccess(req.user, otherParticipantId);
    if (!validation.valid) {
      return res.status(403).json({ success: false, message: validation.message });
    }

    const message = {
      senderId: req.user.id,
      text: String(text).trim(),
      timestamp: new Date().toISOString(),
    };
    chat.messages = [...(chat.messages || []), message];
    await chat.save();

    await createNotification({
      userId: otherParticipantId,
      type: "chat",
      title: "New message",
      message: `You received a new message from ${req.user.userName}.`,
      entityId: chat._id,
    });

    const io = getIo();
    if (io) {
      io.to(`chat:${chat._id}`).emit("chat:message", {
        chatId: chat._id,
        message,
      });
    }

    res.status(201).json({ success: true, data: chat, message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to send message" });
  }
};

module.exports = {
  getContacts,
  createOrGetChat,
  getChatById,
  sendMessage,
};
