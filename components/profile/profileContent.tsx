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
import ReviewManager from "./ReviewManager";
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

const ProfileContent = memo(function ProfileContent() {
  const { user } = useUserAuth();
  // const { totalCompletedOrders } = useUserPoints();
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
  const profileConfig = useMemo(() => ({ activeTab, user }), [activeTab, user]);

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

  // const handleRecyclingUpdate = useCallback(
  //   (points: number) => {
  //     handleRecyclingPointsUpdate(points);
  //   },
  //   [handleRecyclingPointsUpdate]
  // );

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
    <div
      className="min-h-screen px-4 py-6"
      style={{ background: "var(--color-green-60)" }}
    >
      <div
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6"
        style={{ background: "var(--background)" }}
      >
        {/* Header Section */}
        <ProfileHeader
          user={user}
          tier={tier}
          onOpenRecyclingModal={openRecyclingModal}
          t={t}
        />

        {/* Stats Section - now consumes contexts directly */}

        <StatsSection />

        {/* Points Activity - Only for customers, now consumes contexts directly */}
        {isCustomer && (
          <Suspense fallback={<PointsActivitySkeleton />}>
            <PointsActivity />
          </Suspense>
        )}

        {/* Tabs Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          t={t}
        />

        {/* Tab Content with ReviewManager */}
        <ReviewManager isReviewsTabActive={activeTab === "reviews"}>
          {({
            openReviewModal,
            deleteReview,
            userReviews,
            isReviewsLoading,
          }) => (
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
          )}
        </ReviewManager>

        {/* Modals - Only render when open to reduce DOM size */}
        {isRecyclingModalOpen && (
          <Suspense fallback={<ModalSkeleton />}>
            <RecyclingModal
              modalOpen={isRecyclingModalOpen}
              closeModal={closeRecyclingModal}
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
