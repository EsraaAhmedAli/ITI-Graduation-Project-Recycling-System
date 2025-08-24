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
  isSocketConnected: boolean;
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
  isSocketConnected: false,
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
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // Use refs to prevent stale closures in socket handlers
  const socketRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  // Debounce socket events to prevent rapid updates
  const lastNotificationTime = useRef(0);
  const NOTIFICATION_DEBOUNCE_MS = 100;

  // Check if user should receive notifications
  const shouldDisableNotifications = useMemo(() => {
    return user?.role === "admin" || user?.role === "delivery";
  }, [user?.role]);

  // Optimized mark as read with batch processing
  const markAsRead = useCallback(async (id: string) => {
    if (shouldDisableNotifications) return;

    // Optimistic update
    setNotifications((prev) => 
      prev.map((notif) => 
        notif._id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Send to server asynchronously
    try {
      await api.patch(`/notifications/${id}/mark-read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert optimistic update on error
      setNotifications((prev) => 
        prev.map((notif) => 
          notif._id === id ? { ...notif, isRead: false } : notif
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, [shouldDisableNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (shouldDisableNotifications) return;

    const unreadNotifications = notifications.filter(notif => !notif.isRead);
    if (unreadNotifications.length === 0) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);

    try {
      await api.patch("/notifications/mark-read", {
        notificationIds: [],
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) => {
          const wasUnread = unreadNotifications.some(unread => unread._id === notif._id);
          return wasUnread ? { ...notif, isRead: false } : notif;
        })
      );
      setUnreadCount(unreadNotifications.length);
    }
  }, [shouldDisableNotifications, notifications]);

  const loadMoreNotifications = useCallback(async () => {
    if (shouldDisableNotifications || !hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await api.get(`/notifications?page=${nextPage}&limit=${PAGE_SIZE}`);
      
      const responseData = res.data.data || res.data;
      const newNotifications = (responseData.notifications || []).map(normalizeNotification);
      const paginationData = responseData.pagination || {};

      setNotifications((prev) => {
        // Remove duplicates
        const existingIds = new Set(prev.map(n => n._id));
        const uniqueNew = newNotifications.filter(n => !existingIds.has(n._id));
        return [...prev, ...uniqueNew];
      });
      
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
      const [notifsRes, countRes] = await Promise.all([
        api.get(`/notifications?page=1&limit=${PAGE_SIZE}`),
        api.get("/notifications/unread-count")
      ]);
      
      const responseData = notifsRes.data.data || notifsRes.data;
      const normalizedNotifications = (responseData.notifications || []).map(normalizeNotification);
      const paginationData = responseData.pagination || {};
      
      const unreadCountFromAPI = countRes.data.unreadCount ?? 
        countRes.data.data?.unreadCount ?? 0;

      setNotifications(normalizedNotifications);
      setCurrentPage(1);
      setHasMore(paginationData.hasMore ?? false);
      setUnreadCount(unreadCountFromAPI);
    } catch (error) {
      console.error("❌ Failed to refresh notifications:", error);
    }
  }, [shouldDisableNotifications]);

  const handleNotificationClick = useCallback(async (id: string) => {
    if (shouldDisableNotifications) return;
    await markAsRead(id);
  }, [shouldDisableNotifications, markAsRead]);

  // Socket event handlers (stable references)
  const handleConnect = useCallback(() => {
    console.log("🔗 Socket connected for notifications");
    setIsSocketConnected(true);
    
    if (user?._id && socketRef.current) {
      socketRef.current.emit("joinRoom", { userId: user._id });
      socketRef.current.emit("requestUnreadCount", { userId: user._id });
    }
  }, [user?._id]);

  const handleDisconnect = useCallback(() => {
    console.log("❌ Socket disconnected");
    setIsSocketConnected(false);
  }, []);

  const handleNewNotification = useCallback((newNotification: Notification) => {
    // Debounce rapid notifications
    const now = Date.now();
    if (now - lastNotificationTime.current < NOTIFICATION_DEBOUNCE_MS) {
      return;
    }
    lastNotificationTime.current = now;

    console.log("🔔 New notification received via socket:", newNotification);
    
    const normalizedNew = normalizeNotification(newNotification);

    setNotifications((prevNotifications) => {
      // Check for duplicates
      const exists = prevNotifications.some(notif => notif._id === normalizedNew._id);
      if (exists) {
        console.log("⚠️ Duplicate notification ignored:", normalizedNew._id);
        return prevNotifications;
      }
      
      const updated = [normalizedNew, ...prevNotifications];
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
    
    setUnreadCount((prevCount) => prevCount + 1);

    // Show toast notification asynchronously
    import("react-toastify").then(({ toast }) => {
      const titleText = getLocalizedText(normalizedNew.title);
      const bodyText = getLocalizedText(normalizedNew.body);
      toast.info(`${titleText}: ${bodyText}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }).catch(() => {
      // Silently fail if toast not available
    });
  }, []);

  const handleNotificationCount = useCallback((data: any) => {
    console.log("📊 Unread count update from socket:", data);
    const count = typeof data === 'number' ? data : data.unreadCount || data.count || 0;
    setUnreadCount(count);
  }, []);

  // Socket and data initialization
  useEffect(() => {
    if (!user || !token || shouldDisableNotifications) {
      if (shouldDisableNotifications) {
        setNotifications([]);
        setUnreadCount(0);
        setHasMore(false);
        setCurrentPage(1);
        setIsInitialized(true);
        setIsSocketConnected(false);
      }
      
      // Cleanup existing socket
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      
      return;
    }

    let isMounted = true;
    
    const fetchInitialData = async () => {
      try {
        // Batch initial requests
        const [notifsRes, countRes] = await Promise.allSettled([
          api.get(`/notifications?page=1&limit=${PAGE_SIZE}`),
          api.get("/notifications/unread-count")
        ]);
        
        if (!isMounted) return;

        // Handle notifications response
        if (notifsRes.status === 'fulfilled') {
          const responseData = notifsRes.value.data.data || notifsRes.value.data;
          const normalizedNotifications = (responseData.notifications || []).map(normalizeNotification);
          const paginationData = responseData.pagination || {};
          
          setNotifications(normalizedNotifications);
          setCurrentPage(1);
          setHasMore(paginationData.hasMore ?? false);
        }

        // Handle unread count response
        if (countRes.status === 'fulfilled') {
          const unreadCountValue = countRes.value.data.unreadCount ?? 
            countRes.value.data.data?.unreadCount ?? 0;
          setUnreadCount(unreadCountValue);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
        if (isMounted) setIsInitialized(true);
      }
    };

    fetchInitialData();

    // Socket setup with improved error handling
    try {
      const socket = initSocket(token);
      socketRef.current = socket;

      // Event listeners
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("notification:new", handleNewNotification);
      socket.on("notification:count", handleNotificationCount);
      socket.on("notification:unreadCount", handleNotificationCount);

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setIsSocketConnected(false);
      });

      // Health check ping (less frequent)
      const pingInterval = setInterval(() => {
        if (socket.connected && user?._id) {
          socket.emit("ping", { timestamp: Date.now(), userId: user._id });
        }
      }, 60000); // Ping every 60 seconds instead of 30

      // Cleanup function
      cleanupRef.current = () => {
        clearInterval(pingInterval);
        
        if (socket) {
          socket.off("connect", handleConnect);
          socket.off("disconnect", handleDisconnect);
          socket.off("notification:new", handleNewNotification);
          socket.off("notification:count", handleNotificationCount);
          socket.off("notification:unreadCount", handleNotificationCount);
          socket.off("connect_error");
        }
        
        socketRef.current = null;
      };

    } catch (error) {
      console.error("❌ Failed to initialize socket:", error);
      setIsSocketConnected(false);
    }

    return () => {
      isMounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [user, token, shouldDisableNotifications, handleConnect, handleDisconnect, handleNewNotification, handleNotificationCount]);

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
    isSocketConnected: shouldDisableNotifications ? false : isSocketConnected,
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
    isSocketConnected,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Export helper function for components to use
export { getLocalizedText };