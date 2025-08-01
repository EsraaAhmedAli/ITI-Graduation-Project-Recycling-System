'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { initSocket, getSocket } from '@/lib/socket';
import { useUserAuth } from './AuthFormContext';
import api from '@/lib/axios';

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
  markAllAsRead: () => void;
  loadMoreNotifications: () => void;
  hasMore: boolean;
  loadingMore: boolean;
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
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useUserAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Check if user is admin or delivery - with debug logging
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";
  const shouldDisableNotifications = isAdmin || isDelivery;


  const markAsRead = (id: string) => {
    if (shouldDisableNotifications) {
      return;
    }
    
    setNotifications((prev) =>
      prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (shouldDisableNotifications) {
      console.log('🚫 markAllAsRead blocked for admin/delivery user');
      return;
    }
    
    try {
      const response = await api.patch('/notifications/mark-read', {
        notificationIds: [],
      });

      if (response.data.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const loadMoreNotifications = async () => {
    if (shouldDisableNotifications) {
      console.log('🚫 loadMoreNotifications blocked for admin/delivery user');
      return;
    }
    
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await api.get(`/notifications?page=${nextPage}`);
      const newNotifications = res.data.data.notifications.map((notif: any) => ({
        ...notif,
        isRead: notif.isRead ?? notif.read ?? false,
      }));

      setNotifications((prev) => [...prev, ...newNotifications]);
      setCurrentPage(nextPage);
      setHasMore(res.data.data.hasMore);
    } catch (error) {
      console.error('Failed to load more notifications:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {

    // Only fetch notifications and setup socket for non-admin, non-delivery users
    if (user && token && !shouldDisableNotifications) {
      
      const fetchInitialData = async () => {
        try {
          const [notifsRes, countRes] = await Promise.all([
            api.get('/notifications?page=1'),
            api.get('/notifications/unread-count'),
          ]);

          const normalizedNotifications = notifsRes.data.data.notifications.map((notif: any) => ({
            ...notif,
            isRead: notif.isRead ?? notif.read ?? false,
          }));

          setNotifications(normalizedNotifications);
          setCurrentPage(1);
          setHasMore(notifsRes.data.data.hasMore);
          
          setUnreadCount(countRes.data.data.unreadCount || 0);
        } catch (error) {
          console.error('❌ Failed to fetch notifications:', error);
        }
      };

      fetchInitialData();

      const socket = initSocket(token);

      socket.on('connect', () => {
        socket.emit('test', 'Hello from client');
      });

      socket.on('notification:new', (newNotification: Notification) => {
        const normalizedNew = {
          ...newNotification,
          isRead: newNotification.isRead ?? newNotification.read ?? false,
        };

        setNotifications((prev) => [normalizedNew, ...prev]);
        setUnreadCount((prev) => prev + 1);

        import('react-toastify').then(({ toast }) => {
          toast.info(`${normalizedNew.title}: ${normalizedNew.body}`);
        });
      });

      socket.on('notification:count', (count: number) => {
        setUnreadCount(count);
      });

      socket.onAny((eventName, ...args) => {
        console.log('🔍 Socket event received:', eventName, args);
      });

      return () => {
        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.off('notification:new');
          currentSocket.off('notification:count');
          currentSocket.offAny();
        }
      };
    } else if (shouldDisableNotifications) {
      // Clear notifications for admin/delivery users
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      setCurrentPage(1);
    }
  }, [user, token, shouldDisableNotifications]);

  const handleNotificationClick = async (id: string) => {
    console.log('📝 handleNotificationClick called:', { id, shouldDisableNotifications });
    if (shouldDisableNotifications) {
      console.log('🚫 handleNotificationClick blocked for admin/delivery user');
      return;
    }
    
    try {
      const response = await api.patch(`/notifications/${id}/mark-read`);

      if (response.data.success) {
        const updatedNotification = response.data.data;

        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === updatedNotification._id ? { ...notif, isRead: true } : notif
          )
        );

        const countRes = await api.get('/notifications/unread-count');
        setUnreadCount(countRes.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Return empty/disabled state for admin/delivery users
  const contextValue: NotificationContextType = {
    notifications: shouldDisableNotifications ? [] : notifications,
    unreadCount: shouldDisableNotifications ? 0 : unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    loadMoreNotifications,
    hasMore: shouldDisableNotifications ? false : hasMore,
    loadingMore: shouldDisableNotifications ? false : loadingMore,
  };

 

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};