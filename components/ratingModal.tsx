"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { Star, User, Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

// Types
interface Review {
  customerName: string;
  stars: number;
  comment?: string;
  reviewedAt: string;
  orderDate: string;
}

interface CourierData {
  name: string;
  averageRating: number;
  totalReviews: number;
}

interface ReviewResponse {
  courier: CourierData;
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface RatingModalProps {
  show: boolean;
  onclose: () => void;
  courierId: string | null;
}

// Rating Display Component (reusable)
const RatingDisplay = ({ 
  rating, 
  totalReviews, 
  size = "sm" 
}: {
  rating: number;
  totalReviews: number;
  size?: "sm" | "md" | "lg";
}) => {
  const starSize = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3 h-3";
  const textSize = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";
  
  if (totalReviews === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        <span className={`${textSize} text-gray-500 ml-1`}>No reviews</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className={`${textSize} text-gray-700 ml-1 font-medium`}>
        {rating.toFixed(1)}
      </span>
      <span className={`${textSize} text-gray-500`}>
        ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
      </span>
    </div>
  );
};

// Individual Review Component
const ReviewItem = ({ review }: { review: Review }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {review?.customerName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review?.stars
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {review?.stars} star{review?.stars !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(review?.reviewedAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Order: {new Date(review?.orderDate).toLocaleDateString()}
        </p>
      </div>
    </div>
    {review?.comment && (
      <div className="pl-13">
        <p className="text-sm text-gray-700 italic">
          "{review?.comment}"
        </p>
      </div>
    )}
  </div>
);

// Empty State Component
const EmptyReviews = () => (
  <div className="text-center py-12 text-gray-500">
    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
    <p className="text-lg font-medium mb-2">No reviews yet</p>
    <p className="text-sm">This courier hasn't received any reviews from customers.</p>
  </div>
);

// Loading Component
const LoadingSpinner = () => (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
  </div>
);

// Pagination Component
const Pagination = ({ 
  pagination, 
  onPageChange 
}: { 
  pagination: ReviewResponse['pagination']; 
  onPageChange: (page: number) => void; 
}) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-sm text-gray-500">
        Page {pagination.currentPage} of {pagination.totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main RatingModal Component
export function RatingModal({ show, onclose, courierId }: RatingModalProps) {
  const [reviewDetails, setReviewDetails] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (pageNum: number = 1) => {
    if (!courierId) {
      setError("No courier ID provided");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<ReviewResponse>(
        `/reviews/courier/${courierId}?page=${pageNum}&limit=5`
      );
      setReviewDetails(response.data);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      const errorMessage = err.response?.data?.message || "Failed to load reviews";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage);
  };

  const handleClose = () => {
    setReviewDetails(null);
    setError(null);
    onclose();
  };

  useEffect(() => {
    if (show && courierId) {
      fetchReviews(1);
    } else if (!show) {
      // Reset state when modal closes
      setReviewDetails(null);
      setError(null);
    }
  }, [show, courierId]);

  if (!show) return null;

  return (
    <Modal dismissible show={show} onClose={handleClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Reviews for {reviewDetails?.courier?.name || 'Courier'}
            </h3>
            {reviewDetails?.courier && (
              <div className="mt-1">
                <RatingDisplay 
                  rating={reviewDetails.courier.averageRating} 
                  totalReviews={reviewDetails.courier.totalReviews} 
                  size="md" 
                />
              </div>
            )}
          </div>
        </div>
      </ModalHeader>
      
      <ModalBody className="p-6">
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Error loading reviews</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <button
              onClick={() => fetchReviews(1)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {!loading && !error && reviewDetails && (
          <>
            {reviewDetails.reviews.length === 0 ? (
              <EmptyReviews />
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {reviewDetails.reviews.map((review, index) => (
                    <ReviewItem key={`${review?.reviewedAt}-${index}`} review={review} />
                  ))}
                </div>
                
                <Pagination 
                  pagination={reviewDetails.pagination} 
                  onPageChange={handlePageChange} 
                />
              </>
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
}