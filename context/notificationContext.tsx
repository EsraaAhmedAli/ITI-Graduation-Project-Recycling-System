"use client";

import React, { createContext, useEffect, useState, useContext, useMemo, useCallback, useRef } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { useUserAuth } from "./AuthFormContext";
import api from "@/lib/axios";

interface LocalizedText {
  en: string;
  ar: string;
  _id?: string;
}

interface Notification {
  _id: string;
  title: string | LocalizedText;
  body: string | LocalizedText;
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
  markAllAsRead: () => void;
  loadMoreNotifications: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  handleNotificationClick: () => {},
  markAllAsRead: () => {},
  loadMoreNotifications: () => {},
  hasMore: false,
  loadingMore: false,
  refreshNotifications: () => {},
});

export const useNotification = () => useContext(NotificationContext);

const PAGE_SIZE = 20;
const MAX_NOTIFICATIONS = 1000;

// Helper function to extract text from localized object
const getLocalizedText = (text: string | LocalizedText, language: string = 'en'): string => {
  if (typeof text === 'string') return text;
  return text[language as keyof LocalizedText] || text.en || '';
};

// Helper function to normalize notification data from API response
const normalizeNotification = (notif: any): Notification => ({
  ...notif,
  isRead: notif.isRead ?? notif.read ?? false,
  // Keep original structure but ensure we can extract text when needed
  title: notif.title,
  body: notif.body,
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, token } = useUserAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to prevent stale closures in socket handlers
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);
  
  // Update refs when state changes
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Check if user should receive notifications
  const shouldDisableNotifications = useMemo(() => {
    return user?.role === "admin" || user?.role === "delivery";
  }, [user?.role]);

  // Memoized functions to prevent unnecessary re-renders
  const markAsRead = useCallback((id: string) => {
    if (shouldDisableNotifications) return;

    setNotifications((prev) => {
      const updated = prev.map((notif) =>
        notif._id === id ? { ...notif, isRead: true } : notif
      );
      return updated;
    });
    
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [shouldDisableNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (shouldDisableNotifications) {
      console.log("🚫 markAllAsRead blocked for admin/delivery user");
      return;
    }

    try {
      const response = await api.patch("/notifications/mark-read", {
        notificationIds: [],
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
  }, [shouldDisableNotifications]);

  const loadMoreNotifications = useCallback(async () => {
    if (shouldDisableNotifications || !hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await api.get(`/notifications?page=${nextPage}&limit=${PAGE_SIZE}`);
      
      // Handle new response structure
      const responseData = res.data.data || res.data;
      const newNotifications = (responseData.notifications || []).map(normalizeNotification);
      const paginationData = responseData.pagination || {};

      setNotifications((prev) => [...prev, ...newNotifications]);
      setCurrentPage(nextPage);
      setHasMore(paginationData.hasMore ?? false);
    } catch (error) {
      console.error("Failed to load more notifications:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [shouldDisableNotifications, hasMore, loadingMore, currentPage]);

  const refreshNotifications = useCallback(async () => {
    if (shouldDisableNotifications) return;

    try {
      const notifsRes = await api.get(`/notifications?page=1&limit=${PAGE_SIZE}`);
      
      // Handle new response structure
      const responseData = notifsRes.data.data || notifsRes.data;
      const normalizedNotifications = (responseData.notifications || []).map(normalizeNotification);
      const paginationData = responseData.pagination || {};
      
      // Extract unread count from root level or fallback to calculating it
      const unreadCountFromAPI = notifsRes.data.unreadCount ?? 
        normalizedNotifications.filter(notif => !notif.isRead).length;

      setNotifications(normalizedNotifications);
      setCurrentPage(1);
      setHasMore(paginationData.hasMore ?? false);
      setUnreadCount(unreadCountFromAPI);
    } catch (error) {
      console.error("❌ Failed to refresh notifications:", error);
    }
  }, [shouldDisableNotifications]);

  const handleNotificationClick = useCallback(async (id: string) => {
    if (shouldDisableNotifications) {
      console.log("🚫 handleNotificationClick blocked for admin/delivery user");
      return;
    }

    try {
      const response = await api.patch(`/notifications/${id}/mark-read`);

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );

        // Try to get fresh unread count, but handle both response structures
        try {
          const countRes = await api.get("/notifications/unread-count");
          const unreadCountValue = countRes.data.unreadCount ?? 
            countRes.data.data?.unreadCount ?? 
            0;
          setUnreadCount(unreadCountValue);
        } catch (countError) {
          // Fallback to decrementing if the count endpoint fails
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [shouldDisableNotifications]);

  // Socket and data initialization
  useEffect(() => {
    if (!user || !token || shouldDisableNotifications) {
      if (shouldDisableNotifications) {
        // Clear state for admin/delivery users
        setNotifications([]);
        setUnreadCount(0);
        setHasMore(false);
        setCurrentPage(1);
        setIsInitialized(true);
      }
      return;
    }

    let isMounted = true;
    
    const fetchInitialData = async () => {
      try {
        const notifsRes = await api.get(`/notifications?page=1&limit=${PAGE_SIZE}`);
        
        if (!isMounted) return;

        // Handle new response structure
        const responseData = notifsRes.data.data || notifsRes.data;
        const normalizedNotifications = (responseData.notifications || []).map(normalizeNotification);
        const paginationData = responseData.pagination || {};
        
        // Extract unread count from root level
        const unreadCountValue = notifsRes.data.unreadCount ?? 0;

        setNotifications(normalizedNotifications);
        setCurrentPage(1);
        setHasMore(paginationData.hasMore ?? false);
        setUnreadCount(unreadCountValue);
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
        if (isMounted) setIsInitialized(true);
      }
    };

    fetchInitialData();

    // Socket setup
    const socket = initSocket(token);

    const handleConnect = () => {
      console.log("🔗 Socket connected");
      socket.emit("test", "Hello from client");
      socket.emit("joinRoom", { userId: user._id });
      
      // Request current unread count on connect
      socket.emit("requestUnreadCount", { userId: user._id });
    };

    const handleNewNotification = (newNotification: Notification) => {
      console.log("🔔 New notification received:", newNotification);
      
      const normalizedNew = normalizeNotification(newNotification);

      setNotifications((prev) => {
        // Check for duplicates
        const exists = prev.some(notif => notif._id === normalizedNew._id);
        if (exists) return prev;
        
        const updated = [normalizedNew, ...prev];
        return updated.slice(0, MAX_NOTIFICATIONS); // Limit size
      });
      
      setUnreadCount((prev) => prev + 1);

      // Show toast notification with localized text
      import("react-toastify").then(({ toast }) => {
        const titleText = getLocalizedText(normalizedNew.title);
        const bodyText = getLocalizedText(normalizedNew.body);
        toast.info(`${titleText}: ${bodyText}`);
      });
    };

    const handleNotificationCount = (data: any) => {
      console.log("📊 Unread count update:", data);
      const count = typeof data === 'number' ? data : data.unreadCount || data.count || 0;
      setUnreadCount(count);
    };

    // Attach socket listeners
    socket.on("connect", handleConnect);
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:count", handleNotificationCount);
    socket.on("notification:unreadCount", handleNotificationCount);
    
    // Handle reconnection
    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected");
      socket.emit("joinRoom", { userId: user._id });
      socket.emit("requestUnreadCount", { userId: user._id });
    });

    // Debug logging
    socket.onAny((eventName, ...args) => {
      console.log("🔍 Socket event received:", eventName, args);
    });

    return () => {
      isMounted = false;
      const currentSocket = getSocket();
      if (currentSocket) {
        currentSocket.off("connect", handleConnect);
        currentSocket.off("notification:new", handleNewNotification);
        currentSocket.off("notification:count", handleNotificationCount);
        currentSocket.off("notification:unreadCount", handleNotificationCount);
        currentSocket.off("reconnect");
        currentSocket.offAny();
      }
    };
  }, [user, token, shouldDisableNotifications]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<NotificationContextType>(() => ({
    notifications: shouldDisableNotifications ? [] : notifications,
    unreadCount: shouldDisableNotifications ? 0 : unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    loadMoreNotifications,
    hasMore: shouldDisableNotifications ? false : hasMore,
    loadingMore: shouldDisableNotifications ? false : loadingMore,
    refreshNotifications,
  }), [
    shouldDisableNotifications,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    loadMoreNotifications,
    hasMore,
    loadingMore,
    refreshNotifications,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Export helper function for components to use
export { getLocalizedText };