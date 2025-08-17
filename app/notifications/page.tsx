"use client";

import { useNotification, getLocalizedText } from "@/context/notificationContext";
import { useLanguage } from "@/context/LanguageContext"; // Update path as needed
import { Bell, CheckCircle, Loader2 } from "lucide-react";

// Translation strings
const translations = {
  en: {
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications yet",
    loadMore: "Load more",
    justNow: "just now",
    minutesAgo: "min ago",
    hoursAgo: "h ago",
    daysAgo: "d ago",
  },
  ar: {
    notifications: "الإشعارات",
    markAllRead: "تعيين الكل كمقروء",
    noNotifications: "لا توجد إشعارات بعد",
    loadMore: "تحميل المزيد",
    justNow: "الآن",
    minutesAgo: "د مضت",
    hoursAgo: "س مضت",
    daysAgo: "ي مضت",
  }
};

// Helper function to get translation
const getTranslation = (key: keyof typeof translations.en, locale: string) => {
  return translations[locale as keyof typeof translations]?.[key] || translations.en[key];
};

// Localized "time ago" formatter
function timeAgo(dateString: string, locale: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return getTranslation("justNow", locale);
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} ${getTranslation("minutesAgo", locale)}`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}${getTranslation("hoursAgo", locale)}`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}${getTranslation("daysAgo", locale)}`;
  
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    handleNotificationClick,
    loadMoreNotifications,
    hasMore,
    loadingMore,
  } = useNotification();
  
  const { locale } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto p-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-green-600" />
          {getTranslation("notifications", locale)}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
          >
            {getTranslation("markAllRead", locale)}
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            {getTranslation("noNotifications", locale)}
          </div>
        ) : (
          notifications.map((notif) => {
            // Extract localized text
            const titleText = getLocalizedText(notif.title, locale);
            const bodyText = getLocalizedText(notif.body, locale);
            
            return (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif._id)}
                className={`p-4 rounded-xl border shadow-sm cursor-pointer transition hover:shadow-md ${
                  notif.isRead
                    ? "bg-white border-gray-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.isRead && (
                    <span className="w-2 h-2 mt-2 rounded-full bg-green-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-800">{titleText}</h2>
                    <p className="text-sm text-gray-600">{bodyText}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        {timeAgo(notif.createdAt, locale)}
                      </p>
                      {/* Show order status if available */}
                      {notif.orderId?.status && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {locale === 'ar' ? 
                            (notif.orderId.status === 'completed' ? 'مكتمل' : 
                             notif.orderId.status === 'pending' ? 'قيد الانتظار' : 
                             notif.orderId.status === 'cancelled' ? 'ملغى' : 
                             notif.orderId.status === 'processing' ? 'قيد المعالجة' :
                             notif.orderId.status === 'shipped' ? 'تم الشحن' :
                             notif.orderId.status === 'delivered' ? 'تم التسليم' :
                             notif.orderId.status) : 
                            notif.orderId.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {notif.isRead && (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {hasMore && notifications.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMoreNotifications}
            disabled={loadingMore}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {getTranslation("loadMore", locale)}
          </button>
        </div>
      )}
    </div>
  );
}