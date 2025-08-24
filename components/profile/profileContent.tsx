// components/profile/ProfileContent.tsx
"use client";

import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  Suspense,
  lazy,
  startTransition,
  useEffect,
} from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useLanguage } from "@/context/LanguageContext";
import { useUserPoints } from "@/context/UserPointsContext";
import { useRouter } from "next/navigation";

import { useProfileLogic } from "@/hooks/useProfileLogic";
import ProfileHeader from "./profileHeader";
import StatsSection from "./statsSection";
import TabNavigation from "./tabNavigation";
import TabContent from "./tabContent";

// Lazy imports - only load when needed
const RecyclingModal = lazy(
  () => import("@/components/eWalletModal/ewalletModal")
);
const ItemsModal = lazy(() => import("@/components/shared/itemsModal"));
const PointsActivity = lazy(() => import("@/components/accordion/accordion"));

// Minimal loading components
const ModalSkeleton = () => null;
const PointsActivitySkeleton = () => (
  <div className="animate-pulse h-20 bg-gray-200 rounded" />
);

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
  const {
    userPoints,
    pointsLoading,
    totalCompletedOrders,
    totalPointsHistoryLength,
  } = useUserPoints();
  const { t } = useLanguage();
  const router = useRouter();

  // Simplified state management
  const [activeTab, setActiveTab] = useState("incoming");
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(
    null
  );

  // Minimal profile config - only essential data
  const profileConfig = useMemo(
    () => ({ activeTab, user, totalCompletedOrders }),
    [activeTab, user, totalCompletedOrders]
  );

  const {
    allOrders,
    isLoading,
    isFetchingNextPage,
    tier,
    tabs,
    filteredOrders,
    shouldShowSeeMore,
    loadMoreOrders,
    handleCancelOrder,
    handleRecyclingPointsUpdate,
  } = useProfileLogic(profileConfig);

  // Optimized handlers with startTransition for non-urgent updates
  const handleTabChange = useCallback((tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  const openRecyclingModal = useCallback(
    () => setIsRecyclingModalOpen(true),
    []
  );
  const closeRecyclingModal = useCallback(
    () => setIsRecyclingModalOpen(false),
    []
  );

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

  const handleRecyclingUpdate = useCallback(
    (points: number) => {
      handleRecyclingPointsUpdate(points);
    },
    [handleRecyclingPointsUpdate]
  );

  useEffect(() => {
  console.log("🔄 PARENT - RecyclingModal open state:", isRecyclingModalOpen);
}, [isRecyclingModalOpen]);
  // Early return for loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-6">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isCustomer = user.role === "customer";

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--color-green-60)" }}>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6" style={{ background: "var(--background)" }}>
        {/* Header Section */}
        <ProfileHeader
          user={user}
          tier={tier}
          onOpenRecyclingModal={openRecyclingModal}
          t={t}
        />

        {/* Stats Section */}
        <StatsSection
          totalCompletedOrders={totalCompletedOrders}
          userPoints={userPoints}
          pointsLoading={pointsLoading}
          user={user}
          t={t}
        />

        {/* Points Activity - Only for customers, load only when needed */}
        {isCustomer && (
          <Suspense fallback={<PointsActivitySkeleton />}>
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
          onTabChange={handleTabChange}
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

        {/* Modals - Only render when open to reduce DOM size */}
        {isRecyclingModalOpen && (
          <Suspense fallback={<ModalSkeleton />}>
            <RecyclingModal
              onPointsUpdated={handleRecyclingUpdate}
              modalOpen={isRecyclingModalOpen}
              closeModal={closeRecyclingModal}
              totalPoints={userPoints?.totalPoints}
            />
          </Suspense>
        )}

        {isItemsModalOpen && (
          <Suspense fallback={<ModalSkeleton />}>
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
