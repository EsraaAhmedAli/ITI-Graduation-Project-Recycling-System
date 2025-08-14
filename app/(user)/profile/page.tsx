// Optimized ProfilePage component with better performance

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { Avatar } from "flowbite-react";
import Loader from "@/components/common/Loader";
import api from "@/lib/axios";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Link from "next/link";
import {
  CheckCircle,
  Clock1,
  MapPin,
  Package,
  Pencil,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

// Import the new components
import ReviewManager from "@/components/profile/ReviewManager";
import OrderActions from "@/components/profile/OrderActions";

import RecyclingModal from "@/components/eWalletModal/ewalletModal";
import ItemsModal from "@/components/shared/itemsModal";
import PointsActivity from "@/components/accordion/accordion";
import MembershipTier, {
  getUserTier,
} from "@/components/memberTireShip/memberTireShip";
import { useLanguage } from "@/context/LanguageContext";
import useOrders from "@/hooks/useGetOrders";
import { useUserPoints } from "@/context/UserPointsContext";
import { rewardLevels } from "@/constants/rewardsTiers";
import ReviewsTab from "@/components/profile/ReviewTabs";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import React from "react";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ReviewManager>
        {({ openReviewModal, deleteReview, userReviews, isReviewsLoading }) => (
          <ProfileContent
            openReviewModal={openReviewModal}
            deleteReview={deleteReview}
            userReviews={userReviews}
            isReviewsLoading={isReviewsLoading}
          />
        )}
      </ReviewManager>
    </ProtectedRoute>
  );
}

function ProfileContent({
  openReviewModal,
  deleteReview,
  userReviews,
  isReviewsLoading,
}: {
  openReviewModal: (order: any) => void;
  deleteReview: (orderId: string) => Promise<void>;
  userReviews: any[];
  isReviewsLoading: boolean;
}) {
  const { user } = useUserAuth();

  // Use the optimized context with silent refresh
  const {
    userPoints,
    pointsLoading,
    totalCompletedOrders,
    silentRefresh,
    refreshUserData,
    totalPointsHistoryLength,
  } = useUserPoints();

  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("incoming");
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(
    null
  );

  const router = useRouter();
  const queryClient = useQueryClient();

  // Memoize status parameter calculation
  const statusParam = useMemo(() => {
    if (activeTab === "incoming") return "incoming";
    if (activeTab === "completed") return "completed";
    if (activeTab === "cancelled") return "cancelled";
    return "";
  }, [activeTab]);

  const {
    allOrders,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleCancelOrder: hookHandleCancelOrder,
    refetch,
  } = useOrders({
    limit: 4,
    status: statusParam,
  });

  // Optimized load more function
  const loadMoreOrders = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Enhanced refresh function for recycling modal
  const handleRecyclingPointsUpdate = useCallback(async () => {
    // Use silent refresh to avoid loading states
    await silentRefresh();

    // Invalidate and refetch orders to move completed orders between tabs
    queryClient.invalidateQueries({ queryKey: ["orders"] });

    // Refetch current orders to reflect status changes
    await refetch();

    // If we're on incoming tab, the completed order should disappear
    // If we're on completed tab, the new completed order should appear
    if (activeTab === "completed") {
      // Small delay to ensure backend is fully updated
      setTimeout(() => refetch(), 1000);
    }
  }, [silentRefresh, queryClient, refetch, activeTab]);

  // Enhanced real-time updates with order status changes
  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    // Handle order status updates to move orders between tabs
    const handleOrderStatusUpdate = (data: any) => {
      console.log("Profile: Received order status update:", data);

      // Invalidate and refetch orders to move them between tabs
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // If order completed, update stats immediately
      if (data.status === "completed") {
        // Update completed orders count in context (handled by context)
        // Force refetch of current tab if we're viewing incoming orders
        if (activeTab === "incoming") {
          refetch();
        }

        // If we're on completed tab, refetch to show the new completed order
        if (activeTab === "completed") {
          setTimeout(() => refetch(), 500); // Small delay to ensure backend is updated
        }
      }

      // For other status changes, just refetch current tab
      if (data.status !== "completed") {
        refetch();
      }
    };

    // Handle points updates
    const handlePointsUpdate = (data: any) => {
      console.log("Profile: Received points update:", data);

      // Context handles the points update, but we need to handle recycles count
      // If this is from order completion, the context will handle recycles count too

      // Refetch current tab to ensure order appears in correct place
      setTimeout(() => refetch(), 200);
    };

    // Handle recycling completion
    const handleRecyclingCompleted = (data: any) => {
      console.log("Profile: Received recycling completed:", data);

      // Context handles points and recycles count
      // Refetch orders to move completed order to appropriate tab
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (activeTab === "incoming") {
        refetch(); // Refresh to remove completed order
      }

      if (activeTab === "completed") {
        setTimeout(() => refetch(), 500); // Show new completed order
      }
    };

    socket.on("order:status:updated", handleOrderStatusUpdate);
    socket.on("points:updated", handlePointsUpdate);
    socket.on("recycling:completed", handleRecyclingCompleted);
    socket.on("order:completed", handleOrderStatusUpdate); // Treat as status update

    return () => {
      socket.off("order:status:updated", handleOrderStatusUpdate);
      socket.off("points:updated", handlePointsUpdate);
      socket.off("recycling:completed", handleRecyclingCompleted);
      socket.off("order:completed", handleOrderStatusUpdate);
    };
  }, [queryClient, refetch, activeTab]);

  // Optimized periodic refresh with intelligent intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Only set up interval if user is active and data exists
    if (userPoints && !document.hidden) {
      // Use different intervals based on tab
      const intervalTime =
        activeTab === "completed"
          ? 10000
          : activeTab === "incoming"
          ? 15000
          : 30000; // More frequent for active tabs

      interval = setInterval(() => {
        if (!document.hidden) {
          // Only refresh if page is visible
          silentRefresh();

          // Refresh orders for active tabs more frequently
          if (activeTab === "incoming" || activeTab === "completed") {
            refetch();
          }
        }
      }, intervalTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [silentRefresh, activeTab, userPoints, refetch]);

  // Optimized cancel order function
  const handleCancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await hookHandleCancelOrder(orderId);
        await refetch();
        // Use silent refresh to avoid loading states
        await silentRefresh();
      } catch (error) {
        console.error("Failed to cancel order:", error);
      }
    },
    [hookHandleCancelOrder, refetch, silentRefresh]
  );

  // Optimized modal handlers
  const openItemsModal = useCallback(
    (items: any[], orderStatus: string, order: any) => {
      setSelectedOrderItems(items);
      setSelectedOrderStatus(orderStatus);
      setSelectedOrder(order);
      setIsItemsModalOpen(true);
    },
    []
  );

  const closeItemsModal = useCallback(() => {
    setSelectedOrderItems([]);
    setSelectedOrderStatus(null);
    setSelectedOrder([]);
    setIsItemsModalOpen(false);
  }, []);

  // Optimized visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Use a small delay to prevent excessive calls when rapidly switching tabs
        const timeoutId = setTimeout(() => {
          silentRefresh();
          refetch();
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [silentRefresh, refetch]);

  // Memoize filtered orders to prevent unnecessary recalculations
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (user?.role === "buyer" && order.status === "cancelled") {
        return false;
      }
      return true;
    });
  }, [allOrders, user?.role]);

  // Memoize stats calculation
  const stats = useMemo(
    () => ({
      totalRecycles: totalCompletedOrders,
      points: userPoints?.totalPoints || 0,
      categories: 4,
      tier: 50,
    }),
    [totalCompletedOrders, userPoints?.totalPoints]
  );

  // Memoize tabs calculation
  const tabs = useMemo(() => {
    const baseTabs = ["incoming", "completed"];

    if (user?.role === "buyer") {
      baseTabs.push("payments");
    } else {
      baseTabs.push("cancelled");
    }

    if (user?.role === "customer" || user?.role === "buyer") {
      baseTabs.push("reviews");
    }

    return baseTabs;
  }, [user?.role]);

  // Memoize tier calculation
  const tier = useMemo(() => {
    return rewardLevels.find(
      (tier) =>
        totalCompletedOrders >= tier.minRecycles &&
        totalCompletedOrders <= tier.maxRecycles
    );
  }, [totalCompletedOrders]);

  const shouldShowSeeMore = hasNextPage && filteredOrders.length >= 4;

  return (
    <div className="h-auto bg-green-50 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          {/* Left: Avatar + Info */}
          <div className="flex items-center space-x-4">
            <div className="relative inline-block">
              {/* Avatar */}
              <Avatar
                img={
                  user?.imgUrl ||
                  "https://api.dicebear.com/7.x/bottts/svg?seed=user123"
                }
                rounded
                size="lg"
              />

              {/* Tier Badge */}
              {user.role === "customer" && tier && (
                <div
                  className={`absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4
               size-10 rounded-full flex items-center justify-center
               text-2xl font-bold shadow-md border-2 animate-spin-slow hover:[animation-play-state:paused bg-base-100 border-none`}
                >
                  <tier.badge className="text-primary" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-green-800">
                {user?.name || "John Doe"}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {user?.phoneNumber?.padStart(11, "0")}
              </p>
              <p className="text-xs text-gray-400">Cairo, July 2025</p>
            </div>
          </div>

          <div className="flex gap-4 items-center mt-4">
            {user?.role !== "buyer" && (
              <button
                onClick={() => setIsRecyclingModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
              >
                <RefreshCcw size={18} />
                {t("profile.returnEarn")}
              </button>
            )}
            <Link
              href="/editprofile"
              className="flex items-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors duration-200"
            >
              <Pencil size={16} />
              {t("profile.editProfile")}
            </Link>
          </div>
        </div>

        <RecyclingModal
          onPointsUpdated={handleRecyclingPointsUpdate}
          modalOpen={isRecyclingModalOpen}
          closeModal={() => setIsRecyclingModalOpen(false)}
          totalPoints={userPoints?.totalPoints}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox
            label={t("profile.stats.recycles")}
            value={totalCompletedOrders}
          />
          {user?.role !== "buyer" && (
            <StatBox
              label={t("profile.stats.points")}
              value={userPoints?.totalPoints}
              loading={pointsLoading}
            />
          )}

          {user.role === "customer" && (
            <MembershipTier totalRecycles={totalCompletedOrders} />
          )}
        </div>

        {user?.role === "customer" && (
          <PointsActivity
            userPoints={userPoints}
            userPointsLength={totalPointsHistoryLength}
          />
        )}

        {/* Tabs */}
        <div className="flex border-b gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-2 capitalize font-semibold text-sm border-b-2 transition-colors duration-200 ${
                activeTab === tab
                  ? "border-green-600 text-green-800"
                  : "border-transparent text-gray-500 hover:text-green-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {t(`profile.tabs.${tab}`) || tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "payments" ? (
          <PaymentsHistory />
        ) : activeTab === "reviews" ? (
          isReviewsLoading ? (
            <Loader title=" reviews..." />
          ) : (
            <ReviewsTab
              userReviews={userReviews}
              onEditReview={openReviewModal}
              onDeleteReview={deleteReview}
            />
          )
        ) : isLoading ? (
          <Loader title=" orders..." />
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">
            No orders in this tab yet.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  user={user}
                  userReviews={userReviews}
                  onViewDetails={openItemsModal}
                  onRateOrder={openReviewModal}
                  onCancelOrder={handleCancelOrder}
                  onNavigate={(orderId) =>
                    router.push(`/pickup/tracking/${orderId}`)
                  }
                  t={t}
                />
              ))}
            </div>

            {/* Load More Button */}
            {shouldShowSeeMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMoreOrders}
                  disabled={isFetchingNextPage}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? "Loading more..." : "See More"}
                </button>
              </div>
            )}
          </div>
        )}

        <ItemsModal
          selectedOrder={selectedOrder}
          orderStatus={selectedOrderStatus}
          userRole={user?.role}
          show={isItemsModalOpen}
          onclose={closeItemsModal}
          selectedOrderItems={selectedOrderItems}
        />
      </div>
    </div>
  );
}

// Memoized OrderCard component for better performance
const OrderCard = React.memo(function OrderCard({
  order,
  user,
  userReviews,
  onViewDetails,
  onRateOrder,
  onCancelOrder,
  onNavigate,
  t,
}: {
  order: any;
  user: any;
  userReviews: any[];
  onViewDetails: (items: any[], orderStatus: string, order: any) => void;
  onRateOrder: (order: any) => void;
  onCancelOrder: (orderId: string) => void;
  onNavigate: (orderId: string) => void;
  t: (key: string) => string;
}) {
  const handleNavigate = useCallback(() => {
    onNavigate(order._id);
  }, [onNavigate, order._id]);

  return (
    <div className="rounded-xl p-5 bg-gradient-to-br from-green-50 to-white shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:cursor-pointer">
      {/* Header with Order Info */}
      <div
        onClick={handleNavigate}
        className="flex justify-between items-start mb-4"
      >
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-1">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs">
            {t("profile.orders.date")}:{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} t={t} />
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-1">Pickup Location</p>
          <p className="text-xs leading-relaxed">
            {order.address.street}, Bldg {order.address.building}, Floor{" "}
            {order.address.floor}, {order.address.area}, {order.address.city}
          </p>
        </div>
      </div>

      {/* Order Actions */}
      <OrderActions
        order={order}
        userRole={user?.role}
        userReviews={userReviews}
        onViewDetails={onViewDetails}
        onRateOrder={onRateOrder}
        onCancelOrder={onCancelOrder}
      />
    </div>
  );
});

// Memoized StatusBadge component
const StatusBadge = React.memo(function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: (key: string) => string;
}) {
  const statusConfig = useMemo(() => {
    const configs = {
      assigntocourier: {
        icon: <Truck size={14} />,
        className: "bg-yellow-100 text-yellow-800",
        text: t("profile.orders.status.inTransit"),
      },
      pending: {
        icon: <Clock1 size={14} />,
        className: "bg-orange-100 text-orange-800",
        text: t("profile.orders.status.pending"),
      },
      collected: {
        icon: <Package size={14} />,
        className: "bg-blue-100 text-blue-800",
        text: t("profile.orders.status.collected") || "Collected",
      },
      completed: {
        icon: <CheckCircle size={14} />,
        className: "bg-green-100 text-green-800",
        text: t("profile.orders.status.completed"),
      },
      cancelled: {
        icon: <XCircle size={14} />,
        className: "bg-red-100 text-red-800",
        text: t("profile.orders.status.cancelled"),
      },
    };

    return configs[status as keyof typeof configs];
  }, [status, t]);

  if (!statusConfig) return null;

  return (
    <div
      className={`flex items-center gap-1 ${statusConfig.className} px-3 py-1 rounded-full text-xs font-medium`}
    >
      {statusConfig.icon}
      {statusConfig.text}
    </div>
  );
});

// StatBox component remains the same but memoized
const StatBox = React.memo(function StatBox({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: number;
  loading?: boolean;
}) {
  return (
    <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-sm">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-green-200 rounded mb-1"></div>
          <div className="h-4 bg-green-200 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm">{label}</p>
        </>
      )}
    </div>
  );
});

// Memoized PaymentsHistory component
const PaymentsHistory = React.memo(function PaymentsHistory() {
  const { user } = useUserAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api
        .get(`/users/${user._id}/payments`)
        .then((res) => {
          setPayments(res.data);
        })
        .catch((err) => {
          console.error("Failed to load payment history", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?._id]);

  if (loading) return <Loader title=" payments..." />;

  if (!payments.length)
    return <p className="text-center text-gray-500">No payments found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.isArray(payments) &&
        payments.map((payment, index) => (
          <PaymentCard key={payment._id || index} payment={payment} />
        ))}
    </div>
  );
});

// Memoized PaymentCard component
const PaymentCard = React.memo(function PaymentCard({
  payment,
}: {
  payment: any;
}) {
  return (
    <div className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <span>
          Date:{" "}
          {payment.created
            ? new Date(payment.created * 1000).toLocaleDateString()
            : "Unknown Date"}
        </span>
        <div className="text-right">
          <div className="font-bold text-green-600">
            {(payment.amount / 100).toFixed(2)} EGP
          </div>
        </div>
      </div>

      <div className="mt-1 text-sm text-gray-600">
        Status:{" "}
        <span className="capitalize text-green-700 font-medium">
          {payment.status}
        </span>
      </div>

      {payment.receipt_url && (
        <a
          href={payment.receipt_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-green-600 hover:underline"
        >
          View Receipt
        </a>
      )}
    </div>
  );
});
