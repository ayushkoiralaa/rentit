import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { notificationsApi } from "../api/marketplace.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30000;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.list();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
      setLoaded(true);
    } catch {
      // Silently ignore — the badge just keeps its last known value.
    }
  }, [user]);

  // Initial load + reload whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoaded(false);
      return;
    }
    refresh();
  }, [user, refresh]);

  // Light polling so the badge updates even if something else (a new
  // booking, message, etc.) creates a notification in the background.
  useEffect(() => {
    if (!user) return;
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [user, refresh]);

  const markRead = useCallback(async (id) => {
    await notificationsApi.markRead(id);
    // Update local state immediately instead of waiting on the next poll,
    // and re-derive unreadCount from the updated list so it can't drift.
    setNotifications((prev) => {
      const next = prev.map((n) => (n._id === id ? { ...n, read: true } : n));
      setUnreadCount(next.filter((n) => !n.read).length);
      return next;
    });
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loaded, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
