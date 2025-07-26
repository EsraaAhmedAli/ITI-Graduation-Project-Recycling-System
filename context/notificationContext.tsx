"use client";

import React, { createContext, useEffect, useState, useContext } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { useUserAuth } from "./AuthFormContext";
import api from "@/lib/axios";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  orderId?: any;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  handleNotificationClick: (id: string) => void;
  markAllAsRead:()=>void
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  handleNotificationClick: () => {},
  markAllAsRead:()=>{}
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useUserAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

const markAllAsRead = async () => {
  try {
    // Sending empty array marks all unread notifications as read
    const response = await api.patch("/notifications/mark-read", {
      notificationIds: []
    });

    if (response.data.success) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    }
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
};



  useEffect(() => {
    console.log("NotificationProvider effect running", { user: !!user, token: !!token });

    if (user && token) {
      const fetchInitialData = async () => {
        try {
          const [notifsRes, countRes] = await Promise.all([
            api.get("/notifications"),
            api.get("/notifications/unread-count"),
          ]);

          // Normalize isRead field in case backend sends 'read' instead
          const normalizedNotifications = notifsRes.data.data.notifications.map((notif: any) => ({
            ...notif,
            isRead: notif.isRead ?? notif.read ?? false,
          }));

          setNotifications(normalizedNotifications);
          setUnreadCount(countRes.data.data.unreadCount || 0);
        } catch (error) {
          console.error("❌ Failed to fetch notifications:", error);
        }
      };

      fetchInitialData();

      console.log("Initializing socket connection...");
      const socket = initSocket(token);

      socket.on("connect", () => {
        console.log("Socket connected in NotificationProvider");
        socket.emit("test", "Hello from client");
      });

      socket.on("notification:new", (newNotification: Notification) => {
        console.log("📱 New notification received:", newNotification);

        const normalizedNew = {
          ...newNotification,
          isRead: newNotification.isRead ?? newNotification.read ?? false,
        };

        setNotifications((prev) => [normalizedNew, ...prev]);
        setUnreadCount((prev) => prev + 1);

        import("react-toastify").then(({ toast }) => {
          toast.info(`${normalizedNew.title}: ${normalizedNew.body}`);
        });
      });

      socket.on("notification:count", (count: number) => {
        console.log("📊 Notification count update:", count);
        setUnreadCount(count);
      });

      socket.onAny((eventName, ...args) => {
        console.log("🔍 Socket event received:", eventName, args);
      });

      return () => {
        console.log("Cleaning up socket listeners");
        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.off("notification:new");
          currentSocket.off("notification:count");
          currentSocket.offAny();
        }
      };
    }
  }, [user, token]);

  const handleNotificationClick = async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/mark-read`);

      if (response.data.success) {
        const updatedNotification = response.data.data;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === updatedNotification._id ? { ...notif, isRead: true } : notif
          )
        );

        const countRes = await api.get("/notifications/unread-count");
        setUnreadCount(countRes.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
