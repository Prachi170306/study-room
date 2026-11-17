
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../firebase/config";

import {
  subscribeToNotifications,
  updateNotificationReadStatus,
  markAllNotificationsAsRead
} from "../services/notificationService";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Listen for authentication and notification changes
  useEffect(() => {
    let unsubscribeNotifications = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
      }

      if (!user) {
        setUserId(null);
        setNotifications([]);
        setLoading(false);
        return;
      }

      setUserId(user.uid);
      setLoading(true);
      setError(null);

      unsubscribeNotifications = subscribeToNotifications(
        user.uid,
        (data) => {
          setNotifications(data);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching notifications:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, []);

  // Notification statistics
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter((item) => !item.read).length,
    messages: notifications.filter((item) => item.type === "message").length,
    tasks: notifications.filter((item) => item.type === "task").length
  }), [notifications]);

  // Search and filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchText) ||
        (item.message || "").toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !item.read) ||
        (filter === "read" && item.read) ||
        item.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  // Toggle individual notification
  async function toggleReadStatus(id) {
    if (!userId) return;

    const notification = notifications.find((item) => item.id === id);

    if (!notification) return;

    try {
      await updateNotificationReadStatus(
        userId,
        id,
        !notification.read
      );
    } catch (err) {
      console.error("Error updating notification:", err);
      setError(err.message);
    }
  }

  // Mark individual notification as read
  async function markAsRead(id) {
    if (!userId) return;

    try {
      await updateNotificationReadStatus(userId, id, true);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.message);
    }
  }

  // Mark individual notification as unread
  async function markAsUnread(id) {
    if (!userId) return;

    try {
      await updateNotificationReadStatus(userId, id, false);
    } catch (err) {
      console.error("Error marking notification as unread:", err);
      setError(err.message);
    }
  }

  // Mark all notifications as read
  async function markAllAsRead() {
    if (!userId) return;

    try {
      await markAllNotificationsAsRead(userId);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err.message);
    }
  }

  return {
    notifications,
    filteredNotifications,
    stats,
    search,
    setSearch,
    filter,
    setFilter,
    loading,
    error,
    toggleReadStatus,
    markAsRead,
    markAsUnread,
    markAllAsRead
  };
}
