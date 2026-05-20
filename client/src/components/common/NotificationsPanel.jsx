import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { registerSocketUser, subscribeToSocketEvent } from "@/lib/socket";

import { apiUrl } from "@/lib/api";
function NotificationsPanel({ allowedTypes = [] }) {
  const [notifications, setNotifications] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const visibleNotifications = useMemo(() => {
    if (!allowedTypes.length) {
      return notifications;
    }

    return notifications.filter((notification) => allowedTypes.includes(notification.type));
  }, [allowedTypes, notifications]);
  const unreadCount = visibleNotifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return undefined;
    }

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(apiUrl("/api/notifications"), {
          withCredentials: true,
        });
        setNotifications(response.data?.data || []);
      } catch (error) {
        setNotifications([]);
      }
    };

    registerSocketUser(user);
    fetchNotifications();

    const unsubscribe = subscribeToSocketEvent("notification:new", (notification) => {
      if (String(notification.userId) !== String(user.id)) {
        return;
      }

      setNotifications((current) => {
        const withoutDuplicate = current.filter(
          (existingNotification) => String(existingNotification._id) !== String(notification._id)
        );
        return [notification, ...withoutDuplicate];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const markRead = async (notificationId) => {
    try {
      await axios.put(
        apiUrl("/api/notifications/read"),
        { notificationId },
        { withCredentials: true }
      );
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: 1 } : notification
        )
      );
    } catch (error) {
      // ignore inline failure
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-white">
          {unreadCount} unread
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {visibleNotifications.length ? (
          visibleNotifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => markRead(notification._id)}
              className={`block w-full rounded-2xl border px-4 py-3 text-left ${
                notification.isRead ? "border-slate-200 bg-slate-50" : "border-sky-200 bg-sky-50"
              }`}
            >
              <p className="font-medium text-slate-900">{notification.title}</p>
              <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
