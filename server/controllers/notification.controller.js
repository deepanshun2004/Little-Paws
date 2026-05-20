const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      data: notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch notifications" });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: 1 },
        { new: true }
      );
      return res.status(200).json({ success: true, data: notification });
    }

    const notifications = await Notification.find({ userId: req.user.id });
    await Promise.all(
      notifications.map((notification) =>
        Notification.findByIdAndUpdate(notification._id, { isRead: 1 }, { new: true })
      )
    );
    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update notification" });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
};
