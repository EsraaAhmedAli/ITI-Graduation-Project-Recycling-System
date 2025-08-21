// components/profile/ProfileContent.tsx
"use client";

import React, { memo, useState, useCallback, useMemo, Suspense } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useLanguage } from "@/context/LanguageContext";
import { useUserPoints } from "@/context/UserPointsContext";
import { useRouter } from "next/navigation";

import dynamic from "next/dynamic";
import { useProfileLogic } from "@/hooks/useProfileLogic";
import ProfileHeader from "./profileHeader";
import StatsSection from "./statsSection";
import TabNavigation from "./tabNavigation";
import TabContent from "./tabContent";


// Dynamic imports
const RecyclingModal = dynamic(() => import("@/components/eWalletModal/ewalletModal"), {
  loading: () => null,
  ssr: false
});

const ItemsModal = dynamic(() => import("@/components/shared/itemsModal"), {
  loading: () => null,
  ssr: false
});

const PointsActivity = dynamic(() => import("@/components/accordion/accordion"), {
  loading: () => <div className="animate-pulse h-16 bg-gray-200 rounded" />,
  ssr: false
});

interface ProfileContentProps {
  openReviewModal: (order: any) => void;
  deleteReview: (orderId: string) => Promise<void>;
  userReviews: any[];
  isReviewsLoading: boolean;
}

const ProfileContent = memo(function ProfileContent({
  openReviewModal,
  deleteReview,
  userReviews,
  isReviewsLoading,
}: ProfileContentProps) {
  const { user } = useUserAuth();
  const { userPoints, pointsLoading, totalCompletedOrders, silentRefresh, totalPointsHistoryLength } = useUserPoints();
  const { t } = useLanguage();
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState("incoming");
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(null);

  // Custom hook for complex profile logic
  const {
    allOrders,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    tier,
    tabs,
    filteredOrders,
    shouldShowSeeMore,
    loadMoreOrders,
    handleCancelOrder,
    handleRecyclingPointsUpdate,
  } = useProfileLogic({
    activeTab,
    user,
    totalCompletedOrders,
    silentRefresh,
  });

  // Modal handlers
  const openItemsModal = useCallback((items: any[], orderStatus: string, order: any) => {
    setSelectedOrderItems(items);
    setSelectedOrderStatus(orderStatus);
    setSelectedOrder(order);
    setIsItemsModalOpen(true);
  }, []);

  const closeItemsModal = useCallback(() => {
    setSelectedOrderItems([]);
    setSelectedOrderStatus(null);
    setSelectedOrder([]);
    setIsItemsModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--color-green-50)" }}>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6" style={{ background: "var(--background)" }}>
        {/* Header Section */}
        <ProfileHeader 
          user={user} 
          tier={tier} 
          onOpenRecyclingModal={() => setIsRecyclingModalOpen(true)}
          t={t}
        />

        {/* Recycling Modal */}
        {isRecyclingModalOpen && (
          <Suspense fallback={null}>
            <RecyclingModal
              onPointsUpdated={handleRecyclingPointsUpdate}
              modalOpen={isRecyclingModalOpen}
              closeModal={() => setIsRecyclingModalOpen(false)}
              totalPoints={userPoints?.totalPoints}
            />
          </Suspense>
        )}

        {/* Stats Section */}
        <StatsSection
          totalCompletedOrders={totalCompletedOrders}
          userPoints={userPoints}
          pointsLoading={pointsLoading}
          user={user}
          t={t}
        />

        {/* Points Activity - Only for customers */}
        {user.role === "customer" && (
          <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded" />}>
            <PointsActivity
              userPoints={userPoints}
              userPointsLength={totalPointsHistoryLength}
            />
          </Suspense>
        )}

        {/* Tabs Navigation */}
        <TabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          t={t}
        />

        {/* Tab Content */}
        <TabContent
          activeTab={activeTab}
          isLoading={isLoading}
          isReviewsLoading={isReviewsLoading}
          filteredOrders={filteredOrders}
          userReviews={userReviews}
          user={user}
          openReviewModal={openReviewModal}
          deleteReview={deleteReview}
          openItemsModal={openItemsModal}
          handleCancelOrder={handleCancelOrder}
          router={router}
          shouldShowSeeMore={shouldShowSeeMore}
          isFetchingNextPage={isFetchingNextPage}
          loadMoreOrders={loadMoreOrders}
          t={t}
        />

        {/* Items Modal */}
        {isItemsModalOpen && (
          <Suspense fallback={null}>
            <ItemsModal
              selectedOrder={selectedOrder}
              orderStatus={selectedOrderStatus}
              userRole={user?.role}
              show={isItemsModalOpen}
              onclose={closeItemsModal}
              selectedOrderItems={selectedOrderItems}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
});

export default ProfileContent;