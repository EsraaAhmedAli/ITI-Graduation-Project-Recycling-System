"use client";

import { useNotification } from "@/context/notificationContext";
import { Bell, CheckCircle, Loader2 } from "lucide-react";

// Simple "time ago" formatter
function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-green-600" />
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
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
                  <h2 className="font-semibold text-gray-800">{notif.title}</h2>
                  <p className="text-sm text-gray-600">{notif.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
                {notif.isRead && (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && notifications.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMoreNotifications}
            disabled={loadingMore}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
