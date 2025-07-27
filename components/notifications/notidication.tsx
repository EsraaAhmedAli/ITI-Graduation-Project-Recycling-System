'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotification } from '@/context/notificationContext';

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    handleNotificationClick,
    loadMoreNotifications,
    hasMore,
    loadingMore,
  } = useNotification();
  

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const IconComponent = notification.icon || Bell;
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification._id)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === 'order'
                          ? 'bg-green-100 text-green-600'
                          : notification.type === 'message'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
<p className="text-gray-600 text-sm mt-1 whitespace-pre-line">
  {notification.body}
</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {hasMore && (
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={loadMoreNotifications}
                disabled={loadingMore}
                className="block w-full px-4 py-2 text-center text-sm text-blue-600 hover:text-blue-700 hover:bg-gray-50 font-medium transition-colors"
              >
                {loadingMore ? 'Loading...' : 'See more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
