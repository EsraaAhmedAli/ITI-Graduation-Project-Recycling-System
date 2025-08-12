'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Package, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotification } from '@/context/notificationContext';

// Helper function to get appropriate icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return Package;
    case 'message':
      return MessageSquare;
    case 'warning':
      return AlertCircle;
    case 'success':
      return CheckCircle;
    default:
      return Bell;
  }
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
markAsRead ,   loadMoreNotifications,
    hasMore,
    loadingMore,
    refreshNotifications,
  } = useNotification();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAllRead) return;
    
    setIsMarkingAllRead(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

 
  // Handle bell click (toggle dropdown)
  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    
    // Refresh notifications when opening
    if (!isNotificationOpen) {
      refreshNotifications?.();
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification._id}
                      onClick={markAsRead }
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                        !notification.isRead 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : 'border-l-transparent'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'order'
                            ? 'bg-green-100 text-green-600'
                            : notification.type === 'message'
                            ? 'bg-blue-100 text-blue-600'
                            : notification.type === 'warning'
                            ? 'bg-orange-100 text-orange-600'
                            : notification.type === 'success'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm leading-tight">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                        
                        <p className="text-gray-400 text-xs mt-2">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="border-t border-gray-100 mt-2">
                    <button
                      onClick={loadMoreNotifications}
                      disabled={loadingMore}
                      className="block w-full px-4 py-3 text-center text-sm text-blue-600 hover:text-blue-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </span>
                      ) : (
                        `Load more (${notifications.length} of many)`
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="px-4 py-12 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium mb-1">No notifications yet</p>
                <p className="text-xs text-gray-400">You'll see updates here when they arrive</p>
              </div>
            )}
          </div>

          {/* Footer - Optional: View All Link */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 mt-2">
              <Link
                href="/notifications"
                className="block w-full px-4 py-2 text-center text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                onClick={() => setIsNotificationOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};