"use client";

import { useEffect, useState } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { Avatar } from "flowbite-react";
import Loader from "@/components/common/loader";
import api from "@/lib/axios";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Link from "next/link";
import { CheckCircle, Clock1, MapPin, Package, Pencil, RefreshCcw, Truck, XCircle } from "lucide-react";
import RecyclingModal from "@/components/eWalletModal/ewalletModal";
import { useUserPoints } from "@/hooks/useGetUserPoints";
import ItemsModal from "@/components/shared/itemsModal";
import PointsActivity from "@/components/accordion/accordion";
import MembershipTier from "@/components/memberTireShip/memberTireShip";
import { useLanguage } from "@/context/LanguageContext";
import { ReceiptLink } from "../../../components/RecipetLink";
import useOrders from "@/hooks/useGetOrders";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token } = useUserAuth();
  console.log(user?.role);
  const { userPoints, pointsLoading, getUserPoints } = useUserPoints({
    userId: user?._id,
    name: user?.name,
    email: user?.email,
  });

  const [activeTab, setActiveTab] = useState("incoming");
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  // Removed unused selectItemStatus state
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(null);
  const { t } = useLanguage();

  // Map activeTab to status parameter
  const getStatusParam = (tab: string) => {
    if (tab === "incoming") {
      return "incoming";
    } else if (tab === "completed") {
      return "completed";
    } else if (tab === "cancelled") {
      return "cancelled";
    }
    return "";
  };

  // Use the orders hook with status filter for better performance
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
    status: getStatusParam(activeTab)
  });

  // Keep total completed orders count for stats (separate call)
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0);

  const loadMoreOrders = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const refreshPoints = async () => {
    await getUserPoints();
  };

  // Use the hook's cancel function
  const handleCancelOrder = async (orderId: string) => {
    await hookHandleCancelOrder(orderId);
    // The hook handles optimistic updates, so we just need to refetch if needed
    await refetch();
  };

  // Fetch total completed orders count for stats (separate call)
  useEffect(() => {
    const fetchCompletedOrdersCount = async () => {
      try {
        const res = await api.get('/orders?status=completed&limit=1');
        setTotalCompletedOrders(res.data.totalCount || 0);
      } catch (error) {
        console.error('Failed to fetch completed orders count:', error);
      }
    };

    if (user && token) {
      fetchCompletedOrdersCount();
      getUserPoints();
    }
  }, [user, token, getUserPoints]);

  // FIXED: Updated function to accept both items and orderStatus
  const openItemsModal = (items: any[], orderStatus: string) => {
    console.log('Opening modal with status:', orderStatus); // Debug log
    setSelectedOrderItems(items);
    setSelectedOrderStatus(orderStatus);
    setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setSelectedOrderItems([]);
    setSelectedOrderStatus(null);
    setIsItemsModalOpen(false);
  };

  // Filter orders for buyer role (hide cancelled orders)
  const filteredOrders = allOrders.filter((order) => {
    if (user?.role === "buyer" && order.status === "cancelled") {
      return false;
    }
    return true;
  });

  // Calculate if we should show "See More" button
  const shouldShowSeeMore = hasNextPage && filteredOrders.length >= 4;

  // Updated stats to use stored points instead of calculated points
  const stats = {
    totalRecycles: totalCompletedOrders, // Use total from backend, not filtered local orders
    points: userPoints?.totalPoints || 0,
    categories: 4,
    tier: 50,
  };

  // Update tabs array to include payment for buyers
  const getTabsForUser = () => {
    const baseTabs = ["incoming", "completed"];
    
    if (user?.role === "buyer") {
      baseTabs.push("payments");
    } else {
      baseTabs.push("cancelled");
    }
    
    return baseTabs;
  };

  const tabs = getTabsForUser();

  return (
    <div className="h-auto bg-green-50 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-4">
            <Avatar
              img={
                user?.imgUrl ||
                "https://api.dicebear.com/7.x/bottts/svg?seed=user123"
              }
              rounded
              size="lg"
            />
            <div>
              <h2 className="text-xl font-semibold text-green-800">
                {user?.name || "John Doe"}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {user?.phoneNumber.padStart(11, "0")}
              </p>
              <p className="text-xs text-gray-400">Cairo, July 2025</p>
            </div>
          </div>

          <div className="flex gap-4 items-center mt-4">
            {/* Return & Earn Button */}
            {user?.role !== "buyer" && (
              <button
                onClick={() => setIsRecyclingModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
              >
                <RefreshCcw size={18} />
                {t("profile.returnEarn")}
              </button>
            )}

            {/* Edit Profile Link */}
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
          onPointsUpdated={refreshPoints}
          modalOpen={isRecyclingModalOpen}
          closeModal={() => setIsRecyclingModalOpen(false)}
          totalPoints={userPoints?.totalPoints}
        />

        {/* Stats - Updated to show loading state for points */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox label={t("profile.stats.recycles")} value={stats.totalRecycles} />
          {user?.role !== "buyer" && (
            <StatBox
              label={t("profile.stats.points")}
              value={stats.points}
              loading={pointsLoading}
            />
          )}
          <MembershipTier totalPoints={userPoints?.totalPoints} />
        </div>

        {user?.role == "customer" && <PointsActivity userPoints={userPoints} />}

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

        {/* Orders or Payments */}
        {activeTab === "payments" ? (
          <PaymentsHistory />
        ) : isLoading ? (
          <Loader title=" orders..." />
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders in this tab yet.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-xl p-5 bg-gradient-to-br from-green-50 to-white shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* Header with Order Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-800 mb-1">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs">
                        {t("profile.orders.date")}: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Enhanced Status Badge with Collected Status */}
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

                  {/* Address with Icon */}
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

                  {/* Action Buttons */}

{/* Action Buttons */}
<div className="flex justify-between items-center pt-3 border-t border-gray-200">
  <div className="flex gap-3">
    <button
      onClick={() => openItemsModal(order.items, order.status)}
      className="text-sm text-green-600 hover:text-green-800 font-medium hover:underline transition-colors duration-200"
    >
      {t("profile.orders.viewDetails")}
    </button>
    
    {/* Enhanced Receipt Link - Show for collected and completed orders */}
    {["collected", "completed"].includes(order.status) && (
      <ReceiptLink orderId={order._id} variant="compact" />
    )}
    
    {/* NEW: Tracking Link - Show for orders in transit */}
    {["assigntocourier", "enroute", "arrived", "collected"].includes(order.status) && (
      <Link
        href={`/pickup/tracking/${order._id}`}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
      >
        Track Order
      </Link>
    )}
  </div>

  {/* Cancel Button - Only for pending orders */}
  {order.status === "pending" && user?.role === "customer" && (
    <button
      onClick={() => handleCancelOrder(order._id)}
      className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-colors duration-200"
    >
      {t("profile.orders.cancelOrder")}
    </button>
  )}
</div>
                  {/* REMOVED: ItemsModal from inside the loop to fix navy background */}
                </div>
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

// Updated StatBox to handle loading state
function StatBox({ label, value, loading = false }: { label: string; value: number; loading?: boolean }) {
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
            className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between"
          >
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
        ))}
    </div>
  );
}