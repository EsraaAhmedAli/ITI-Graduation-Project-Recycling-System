"use client";

import { useState } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { Avatar } from "flowbite-react";
import Loader from "@/components/common/loader";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Link from "next/link";
import {
  CheckCircle,
  Clock1,
  Pencil,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";
import RecyclingModal from "@/components/eWalletModal/ewalletModal";
import { useUserPoints } from "@/hooks/useGetUserPoints";
import ItemsModal from "@/components/shared/itemsModal";
import PointsActivity from "@/components/accordion/accordion";
import MembershipTier from "@/components/memberTireShip/memberTireShip";
import { useLanguage } from "@/context/LanguageContext";
import useOrders from "@/hooks/useGetOrders";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useUserAuth();
  const { t } = useLanguage();

  // Hooks
  const { userPoints, pointsLoading, getUserPoints } = useUserPoints({
    userId: user?._id,
    name: user?.name,
    email: user?.email,
  });

  const {
    allOrders,
    totalOrders,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleCancelOrder,
    getOrdersByTab,
    isCancellingOrder,
  } = useOrders({ limit: 4 });

  // Local state
  const [activeTab, setActiveTab] = useState("incoming");
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);

  // Handlers
  const refreshPoints = async () => {
    await getUserPoints();
  };

  const openItemsModal = (items: any[]) => {
    setSelectedOrderItems(items);
    setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setSelectedOrderItems([]);
    setIsItemsModalOpen(false);
  };

  // Get filtered orders for current tab
  const filteredOrders = getOrdersByTab(activeTab, user?.role);

  // Stats
  const stats = {
    totalRecycles: allOrders.filter((order) => order.status === "completed")
      ?.length,
    points: userPoints?.totalPoints || 0,
    categories: 4,
    tier: 50,
  };

  const tabs = ["incoming", "completed", "cancelled"];

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
          onPointsUpdated={refreshPoints}
          modalOpen={isRecyclingModalOpen}
          closeModal={() => setIsRecyclingModalOpen(false)}
          totalPoints={userPoints?.totalPoints}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox
            label={t("profile.stats.recycles")}
            value={stats.totalRecycles}
          />
          <StatBox
            label={t("profile.stats.points")}
            value={stats.points}
            loading={pointsLoading}
          />
          {/* Your existing MembershipTier component */}
          <MembershipTier totalPoints={userPoints?.totalPoints} />
        </div>
        {/* Points History Section */}
        <PointsActivity userPoints={userPoints} />

        {/* Tabs */}
        <div className="flex border-b gap-6">
          {tabs
            .filter((tab) => !(tab === "cancelled" && user?.role === "buyer"))
            .map((tab) => (
              <button
                key={tab}
                className={`pb-2 capitalize font-semibold text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === tab
                    ? "border-green-600 text-green-800"
                    : "border-transparent text-gray-500 hover:text-green-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`profile.tabs.${tab}`)}
              </button>
            ))}
        </div>

        {/* Orders */}
        {isLoading ? (
          <Loader title="Loading orders..." />
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">
            No orders in this tab yet.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                    <span>
                      {t("profile.orders.date")}:{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      {["assigntocourier"].includes(order.status) && (
                        <>
                          <Truck size={16} className="text-yellow-600" />
                          <span className="text-yellow-700">
                            {t("profile.orders.status.inTransit")}
                          </span>
                        </>
                      )}
                      {["pending"].includes(order.status) && (
                        <>
                          <Clock1 size={16} className="text-yellow-400" />
                          <span className="text-yellow-400">
                            {t("profile.orders.status.pending")}
                          </span>
                        </>
                      )}
                      {order.status === "completed" && (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-green-700">
                            {t("profile.orders.status.completed")}
                          </span>
                        </>
                      )}
                      {order.status === "cancelled" && (
                        <>
                          <XCircle size={16} className="text-red-600" />
                          <span className="text-red-700 capitalize">
                            {t("profile.orders.status.cancelled")}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {order.address.street}, Bldg {order.address.building}, Floor{" "}
                    {order.address.floor}, {order.address.area},{" "}
                    {order.address.city}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => openItemsModal(order.items)}
                      className="text-sm text-green-500 hover:text-green-700 transition"
                    >
                      {t("profile.orders.viewDetails")}
                    </button>

                    {/* Cancel button for pending orders */}
                    {order.status === "pending" && user?.role !== "buyer" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancellingOrder}
                        className="text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50"
                      >
                        {isCancellingOrder ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* See More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCcw size={16} />
                      See More Orders
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Orders Count Info */}
            {totalOrders > 0 && (
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing {allOrders.length} of {totalOrders} orders
              </div>
            )}
          </div>
        )}

        <ItemsModal
          show={isItemsModalOpen}
          onclose={closeItemsModal}
          selectedOrderItems={selectedOrderItems}
        />
      </div>
    </div>
  );
}

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
