// components/profile/ReviewManager.tsx
"use client";
import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import api from "@/lib/axios";
import { ReviewableOrder } from "./ReviewTabs";
import DeliveryReviewModal from "@/app/(user)/pickup/DeliveryReview";

interface ReviewManagerProps {
  isReviewsTabActive?: boolean; // Add this prop to control when to fetch
  children: (props: {
    openReviewModal: (order: ReviewableOrder) => void;
    deleteReview: (orderId: string) => Promise<void>;
    userReviews: any[];
    isReviewsLoading: boolean;
  }) => React.ReactNode;
}

export default function ReviewManager({ children, isReviewsTabActive = false }: ReviewManagerProps) {
  // Only call useReviews when the reviews tab is active
  const { 
    userReviews, 
    isLoading: isReviewsLoading, 
    refetch: refetchReviews 
  } = useReviews({ enabled: isReviewsTabActive });
 
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<ReviewableOrder | null>(null);
  const [existingReviewForOrder, setExistingReviewForOrder] = useState<any>(null);

  const getCourierDisplayName = (courier: any) => {
    if (!courier) return "Unknown Courier";
   
    return courier.name ||
           courier.userName ||
           courier.email?.split('@')[0] ||
           courier.phoneNumber ||
           "Unknown Courier";
  };

  const openReviewModal = (order: ReviewableOrder) => {
    const existingReview = userReviews.find(
      (review) => review.orderId === order._id
    );
   
    setSelectedOrderForReview(order);
    setExistingReviewForOrder(existingReview || null);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedOrderForReview(null);
    setExistingReviewForOrder(null);
    setIsReviewModalOpen(false);
  };

  const handleReviewSubmitted = () => {
    refetchReviews();
    closeReviewModal();
  };

  const deleteReview = async (orderId: string) => {
    try {
      // Use the same endpoint pattern as your modal: orderId/review
      await api.delete(`${orderId}/review`);
      await refetchReviews(); // Refresh the reviews list after deletion
    } catch (error: any) {
      console.error("Failed to delete review:", error);
     
      // Handle specific error cases like in your modal
      if (error.response?.status === 404) {
        throw new Error("Review not found.");
      } else if (error.response?.status === 403) {
        throw new Error("You are not authorized to delete this review.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error("Failed to delete review. Please try again.");
      }
    }
  };

  return (
    <>
      {children({
        openReviewModal,
        deleteReview,
        userReviews: userReviews || [], // Provide empty array if reviews haven't loaded
        isReviewsLoading,
      })}
      <DeliveryReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        orderId={selectedOrderForReview?._id || ""}
        orderInfo={
          selectedOrderForReview
            ? {
                orderNumber: selectedOrderForReview._id.slice(-8).toUpperCase(),
                courierName: getCourierDisplayName(selectedOrderForReview.courier) ||
                            existingReviewForOrder?.courier?.name ||
                            "Unknown Courier",
                orderDate: selectedOrderForReview.createdAt,
                itemCount:
                  selectedOrderForReview.items?.length ||
                  existingReviewForOrder?.itemCount ||
                  0,
              }
            : undefined
        }
        existingReview={
          existingReviewForOrder
            ? {
                rating: existingReviewForOrder.stars,
                comments: existingReviewForOrder.comment,
              }
            : undefined
        }
        onSubmitted={handleReviewSubmitted}
      />
    </>
  );
}