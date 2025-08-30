// components/profile/ReviewsTab.tsx
"use client";

import { Star, MessageSquare, Calendar, Edit3, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { toast } from "react-hot-toast";

export interface Review {
  orderId: string;
  stars: number;
  comment: string;
  reviewedAt: string;
  courier: {
    id: string;
    name: string;
  };
  orderDate: string;
  itemCount?: number;
}

export interface ReviewableOrder {
  _id: string;
  createdAt: string;
  items: any[];
  courier?: {
    _id: string;
    name: string;
  };
  address: any;
  status: string;
}

interface ReviewsTabProps {
  userReviews: Review[];
  onEditReview: (order: ReviewableOrder) => void;
  onDeleteReview: (orderId: string) => void;
}

export default function ReviewsTab({
  userReviews,
  onEditReview,
  onDeleteReview,
}: ReviewsTabProps) {
  const { t } = useLanguage();
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const createMockOrderFromReview = (review: Review): ReviewableOrder => {
    return {
      _id: review.orderId,
      createdAt: review.orderDate || review.reviewedAt,
      items: new Array(review.itemCount || 0).fill({}),
      courier: {
        _id: review.courier.id,
        name: review.courier.name,
      },
      address: {},
      status: "completed",
    };
  };

  const handleDeleteReview = async (orderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
      setDeletingReviewId(orderId);
      try {
        await onDeleteReview(orderId);
        toast.success("Review deleted successfully!");
      } catch (error: any) {
        // Handle the error messages from the ReviewManager
        toast.error(
          error.message || "Failed to delete review. Please try again."
        );
      } finally {
        setDeletingReviewId(null);
      }
    }
  };

  if (userReviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star size={48} className="mx-auto mb-3 text-gray-300" />
        <p>{t("profile.noReveiws")}</p>
        <p className="text-sm">{t("profile.noReveiwsSub")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Your Reviews ({userReviews.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userReviews.map((review) => (
            <div
              key={review.orderId}
              className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-800">
                    Order #{review.orderId.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Courier: {review.courier.name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {new Date(review.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onEditReview(createMockOrderFromReview(review))
                    }
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded-full transition-colors"
                    title="Edit Review"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.orderId)}
                    disabled={deletingReviewId === review.orderId}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Review"
                  >
                    {deletingReviewId === review.orderId ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= review.stars
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  ({review.stars}/5)
                </span>
              </div>

              {review.comment && (
                <p className="text-sm text-gray-700 italic">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
