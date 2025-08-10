// components/pickup/TrackingStepWrapper.tsx
"use client";

import TrackingStep from "@/app/(user)/pickup/tracking/[id]/page";
import ReviewManager from "@/components/profile/ReviewManager";

interface TrackingStepWrapperProps {
  orderId: string;
  onDelivered?: () => void;
  embedded?: boolean;
}

export default function TrackingStepWrapper({ 
  orderId, 
  onDelivered, 
  embedded = false 
}: TrackingStepWrapperProps) {
  return (
    <ReviewManager>
      {({ userReviews, refetch: refetchReviews, isReviewsLoading }) => (
        <TrackingStep
          orderId={orderId}
          onDelivered={onDelivered}
          embedded={embedded}
          // Pass the review manager functions as props
          userReviews={userReviews}
          refetchReviews={refetchReviews}
          isReviewsLoading={isReviewsLoading}
        />
      )}
    </ReviewManager>
  );
}