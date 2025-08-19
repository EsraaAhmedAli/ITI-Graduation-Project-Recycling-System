// components/profile/TabContent.tsx
import React, { memo, Suspense } from "react";
import Loader from "@/components/common/Loader";

import dynamic from "next/dynamic";
import OrderCardSkeleton from "./orderSkeleton";
import OrderCard from "./orderCard";

// Dynamic imports
const PaymentsHistory = dynamic(() => import("./paymentHistory"), {
  loading: () => <Loader title="Loading payments..." />,
  ssr: false
});

const ReviewsTab = dynamic(() => import("@/components/profile/ReviewTabs"), {
  loading: () => <Loader title="Loading reviews..." />,
  ssr: false
});

interface TabContentProps {
  activeTab: string;
  isLoading: boolean;
  isReviewsLoading: boolean;
  filteredOrders: any[];
  userReviews: any[];
  user: any;
  openReviewModal: (order: any) => void;
  deleteReview: (orderId: string) => Promise<void>;
  openItemsModal: (items: any[], orderStatus: string, order: any) => void;
  handleCancelOrder: (orderId: string) => void;
  router: any;
  shouldShowSeeMore: boolean;
  isFetchingNextPage: boolean;
  loadMoreOrders: () => void;
  t: (key: string) => string;
}

const TabContent = memo(function TabContent({
  activeTab,
  isLoading,
  isReviewsLoading,
  filteredOrders,
  userReviews,
  user,
  openReviewModal,
  deleteReview,
  openItemsModal,
  handleCancelOrder,
  router,
  shouldShowSeeMore,
  isFetchingNextPage,
  loadMoreOrders,
  t
}: TabContentProps) {
  // Handle payments tab
  if (activeTab === "payments") {
    return (
      <Suspense fallback={<Loader title={t('loaders.payments')} />}>
        <PaymentsHistory />
      </Suspense>
    );
  }

  // Handle reviews tab
  if (activeTab === "reviews") {
    return isReviewsLoading ? (
      <Loader title={t('loaders.reviews')} />
    ) : (
      <Suspense fallback={<Loader title={t('loaders.reviews')} />}>
        <ReviewsTab
          userReviews={userReviews}
          onEditReview={openReviewModal}
          onDeleteReview={deleteReview}
        />
      </Suspense>
    );
  }

  // Handle loading state for orders
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Handle empty orders
  if (filteredOrders.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        {t("profile.noOrders")}
      </p>
    );
  }

  // Handle orders display
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order: any) => (
          <Suspense key={order._id} fallback={<OrderCardSkeleton />}>
            <OrderCard
              order={order}
              user={user}
              userReviews={userReviews}
              onViewDetails={openItemsModal}
              onRateOrder={openReviewModal}
              onCancelOrder={handleCancelOrder}
              onNavigate={(orderId: string) =>
                router.push(`/pickup/tracking/${orderId}`)
              }
              t={t}
            />
          </Suspense>
        ))}
      </div>

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
  );
});

export default TabContent;