const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

async function createNotification({ userId, title, message, type = "general", entityId = null }) {
  if (!userId) {
    return null;
  }

  const notification = new Notification({
    userId,
    title,
    message,
    type,
    entityId,
    isRead: 0,
  });

  await notification.save();
  emitToUser(userId, "notification:new", notification);
  return notification;
}

module.exports = {
  createNotification,
};
