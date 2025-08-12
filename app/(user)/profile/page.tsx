// Simplified ProfilePage component with extracted review logic

"use client";

import { useEffect, useState } from "react";
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

  // Use context hook with the new refreshUserData function
  const { userPoints, pointsLoading, refreshUserData } = useUserPoints();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("incoming");
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(
    null
  );
  const router = useRouter();
  const queryClient = useQueryClient();

  // Map activeTab to status parameter
  const getStatusParam = (tab: string) => {
    if (tab === "incoming") return "incoming";
    if (tab === "completed") return "completed";
    if (tab === "cancelled") return "cancelled";
    return "";
  };

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
    status: getStatusParam(activeTab),
  });

  const loadMoreOrders = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  // Updated refresh function that also refreshes user data
  const refreshPoints = async () => {
    await refreshUserData(); // Use the new combined refresh function
    // Also invalidate React Query caches
    queryClient.invalidateQueries({ queryKey: ["completedOrdersCount"] });
    queryClient.invalidateQueries({ queryKey: ["userPoints"] });
  };

  const { data: totalCompletedOrders = 0, isLoading: completedOrdersLoading } =
    useQuery({
      queryKey: ["completedOrdersCount", user?._id],
      queryFn: async () => {
        const res = await api.get("/orders?status=completed&limit=1");
        return res.data.totalCount || 0;
      },
      enabled: !!user?._id, // only run when user is loaded
    });

  const handleCancelOrder = async (orderId: string) => {
    await hookHandleCancelOrder(orderId);
    await refetch();
    // Refresh user data in case cancellation affects points/stats
    await refreshUserData();
  };

  const openItemsModal = (items: any[], orderStatus: string) => {
    setSelectedOrderItems(items);
    setSelectedOrderStatus(orderStatus);
    setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setSelectedOrderItems([]);
    setSelectedOrderStatus(null);
    setIsItemsModalOpen(false);
  };

  // NEW: Add effect to listen for order status changes and refresh data
  useEffect(() => {
    // If we're viewing completed orders, periodically refresh to catch status updates
    if (activeTab === "completed") {
      const interval = setInterval(() => {
        refreshUserData();
        queryClient.invalidateQueries({ queryKey: ["completedOrdersCount"] });
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, refreshUserData, queryClient]);

  // NEW: Add effect to refresh data when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Page became visible again, refresh data
        refreshUserData();
        refetch();
        queryClient.invalidateQueries({ queryKey: ["completedOrdersCount"] });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refreshUserData, refetch, queryClient]);

  // Filter orders for buyer role (hide cancelled orders)
  const filteredOrders = allOrders.filter((order) => {
    if (user?.role === "buyer" && order.status === "cancelled") {
      return false;
    }
    return true;
  });

  const shouldShowSeeMore = hasNextPage && filteredOrders.length >= 4;

  const stats = {
    totalRecycles: totalCompletedOrders,
    points: userPoints?.totalPoints || 0,
    categories: 4,
    tier: 50,
  };

  const getTabsForUser = () => {
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
  };

  const tabs = getTabsForUser();
  const tier = rewardLevels.find(
    (tier) =>
      totalCompletedOrders >= tier.minRecycles &&
      totalCompletedOrders <= tier.maxRecycles
  );

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
               text-2xl font-bold shadow-md border-2 animate-spin-slow hover:[animation-play-state:paused] bg-amber-100`}>
                  <span
                    className="size-6 flex items-center justify-center"
                    style={{ backgroundColor: tier.color, color: "white" }}>
                    {tier.badge}
                  </span>
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
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200">
                <RefreshCcw size={18} />
                {t("profile.returnEarn")}
              </button>
            )}
            <Link
              href="/editprofile"
              className="flex items-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors duration-200">
              <Pencil size={16} />
              {t("profile.editProfile")}
            </Link>
          </div>
        </div>
        <RecyclingModal
          onPointsUpdated={refreshPoints}
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
          <PointsActivity userPoints={userPoints} />
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
              onClick={() => setActiveTab(tab)}>
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
                <div
                  key={order._id}
                  className="rounded-xl p-5 bg-gradient-to-br from-green-50 to-white shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:cursor-pointer">
                  {/* Header with Order Info */}
                  <div
                    onClick={() => router.push(`/pickup/tracking/${order._id}`)}
                    className="flex justify-between items-start mb-4">
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
                      {["assigntocourier"].includes(order.status) && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                          <Truck size={14} />
                          {t("profile.orders.status.inTransit")}
                        </div>
                      )}
                      {["pending"].includes(order.status) && (
                        <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                          <Clock1 size={14} />
                          {t("profile.orders.status.pending")}
                        </div>
                      )}
                      {order.status === "collected" && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          <Package size={14} />
                          {t("profile.orders.status.collected") || "Collected"}
                        </div>
                      )}
                      {order.status === "completed" && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          <CheckCircle size={14} />
                          {t("profile.orders.status.completed")}
                        </div>
                      )}
                      {order.status === "cancelled" && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                          <XCircle size={14} />
                          {t("profile.orders.status.cancelled")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <MapPin
                      size={16}
                      className="text-gray-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-800 mb-1">
                        Pickup Location
                      </p>
                      <p className="text-xs leading-relaxed">
                        {order.address.street}, Bldg {order.address.building},
                        Floor {order.address.floor}, {order.address.area},{" "}
                        {order.address.city}
                      </p>
                    </div>
                  </div>

                  {/* Order Actions - Now using the extracted component */}
                  <OrderActions
                    order={order}
                    userRole={user?.role}
                    userReviews={userReviews}
                    onViewDetails={openItemsModal}
                    onRateOrder={openReviewModal}
                    onCancelOrder={handleCancelOrder}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {shouldShowSeeMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMoreOrders}
                  disabled={isFetchingNextPage}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isFetchingNextPage ? "Loading more..." : "See More"}
                </button>
              </div>
            )}
          </div>
        )}

        <ItemsModal
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

// StatBox component remains the same
function StatBox({
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
}

function PaymentsHistory() {
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
  }, [user]);

  if (loading) return <Loader title=" payments..." />;

  if (!payments.length)
    return <p className="text-center text-gray-500">No payments found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.isArray(payments) &&
        payments.map((payment, index) => (
          <div
            key={payment._id || index}
            className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between">
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
                className="mt-3 inline-block text-sm text-green-600 hover:underline">
                View Receipt
              </a>
            )}
          </div>
        ))}
    </div>
  );
}
