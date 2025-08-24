'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Package, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotification, getLocalizedText } from '@/context/notificationContext';
import { useLanguage } from '@/context/LanguageContext'; // Add your language context import

// Helper function to get appropriate icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
    case 'order_assigned':
    case 'order_completed':
    case 'order_cancelled':
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

// Helper function to get color scheme based on notification type
const getNotificationColors = (type: string) => {
  switch (type) {
    case 'order':
    case 'order_assigned':
      return 'bg-blue-100 text-blue-600';
    case 'order_completed':
      return 'bg-green-100 text-green-600';
    case 'order_cancelled':
      return 'bg-red-100 text-red-600';
    case 'message':
      return 'bg-blue-100 text-blue-600';
    case 'warning':
      return 'bg-orange-100 text-orange-600';
    case 'success':
      return 'bg-emerald-100 text-emerald-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// Translation strings
const translations = {
  en: {
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    marking: 'Marking...',
    loadMore: 'Load more notifications',
    loading: 'Loading...',
    viewAll: 'View all notifications',
    noNotifications: 'No notifications yet',
    noNotificationsDesc: "You'll see updates here when they arrive",
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
  },
  ar: {
    notifications: 'الإشعارات',
    markAllRead: 'تعيين الكل كمقروء',
    marking: 'جاري التعيين...',
    loadMore: 'تحميل المزيد من الإشعارات',
    loading: 'جاري التحميل...',
    viewAll: 'عرض جميع الإشعارات',
    noNotifications: 'لا توجد إشعارات بعد',
    noNotificationsDesc: 'ستظهر التحديثات هنا عند وصولها',
    justNow: 'الآن',
    minutesAgo: 'د مضت',
    hoursAgo: 'س مضت',
    daysAgo: 'ي مضت',
  }
};

// Helper function to get translation
const getTranslation = (key: keyof typeof translations.en, locale: string) => {
  return translations[locale as keyof typeof translations]?.[key] || translations.en[key];
};

// Helper function to format relative time with translations
const formatRelativeTime = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return getTranslation('justNow', locale);
  if (diffInMinutes < 60) return `${diffInMinutes}${getTranslation('minutesAgo', locale)}`;
  if (diffInHours < 24) return `${diffInHours}${getTranslation('hoursAgo', locale)}`;
  if (diffInDays < 7) return `${diffInDays}${getTranslation('daysAgo', locale)}`;
  
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
};

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    loadMoreNotifications,
    hasMore,
    loadingMore,
    refreshNotifications,
  } = useNotification();
  
  const { locale } = useLanguage(); // Get current locale from language context

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

  // Handle notification click
  const handleNotificationClick = async (notificationId: string, orderId?: string) => {
    try {
      await markAsRead(notificationId);
      
      // Optional: Navigate to relevant page based on notification type
      if (orderId) {
        // You can add navigation logic here if needed
        console.log('Navigate to order:', orderId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
        aria-label={`${getTranslation('notifications', locale)} ${unreadCount > 0 ? `(${unreadCount} ${locale === 'ar' ? 'غير مقروء' : 'unread'})` : ''}`}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
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
        <div 
          className={`absolute ${locale === 'ar' ? '-left-30' : '-right-30'} mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-[500px] flex flex-col`}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{getTranslation('notifications', locale)}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isMarkingAllRead ? getTranslation('marking', locale) : getTranslation('markAllRead', locale)}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColors(notification.type);
                  
                  // Extract localized text
                  const titleText = getLocalizedText(notification.title, locale);
                  const bodyText = getLocalizedText(notification.body, locale);
                  
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(
                        notification._id, 
                        notification.orderId?._id || notification.orderId
                      )}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                        !notification.isRead 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : 'border-l-transparent'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm leading-tight">
                            {titleText}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {bodyText}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gray-400 text-xs">
                            {formatRelativeTime(notification.createdAt, locale)}
                          </p>
                          
                          {/* Show order status if available */}
                          {notification.orderId?.status && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {locale === 'ar' ? 
                                (notification.orderId.status === 'completed' ? 'مكتمل' : 
                                 notification.orderId.status === 'pending' ? 'قيد الانتظار' : 
                                 notification.orderId.status === 'cancelled' ? 'ملغى' : 
                                 notification.orderId.status === 'assigntocourier' ? 'تم تعيينه للمندوب' : 
                                 notification.orderId.status) : 
                                notification.orderId.status}
                            </span>
                          )}
                        </div>
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
                          {getTranslation('loading', locale)}
                        </span>
                      ) : (
                        getTranslation('loadMore', locale)
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="px-4 py-12 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium mb-1">{getTranslation('noNotifications', locale)}</p>
                <p className="text-xs text-gray-400">{getTranslation('noNotificationsDesc', locale)}</p>
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
                {getTranslation('viewAll', locale)}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};