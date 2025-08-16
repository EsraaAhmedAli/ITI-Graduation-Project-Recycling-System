"use client";
import { useState, useEffect } from "react";
import { X, Star, Send, Package, User, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/axios";

interface DeliveryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderInfo?: {
    orderNumber?: string;
    courierName?: string;
    orderDate?: string;
    itemCount?: number;
  };
  existingReview?: {
    rating: number;
    comments: string;
  };
  onSubmitted?: (reviewData?: any) => void; // Update to accept review data
}

export default function DeliveryReviewModal({
  isOpen,
  onClose,
  orderId,
  orderInfo,
  existingReview,
  onSubmitted,
}: DeliveryReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  // Reset form when modal opens/closes or existing review changes
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating || 0);
        setComments(existingReview.comments || "");
      } else {
        setRating(0);
        setComments("");
      }
      setSubmissionAttempted(false);
    }
  }, [isOpen, existingReview]);
const handleSubmit = async () => {
  if (rating === 0) {
    toast.error("Please select a rating");
    return;
  }

  setLoading(true);
  setSubmissionAttempted(true);

  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error("Invalid rating value");
    }

    // Validate comments length
    if (comments.length > 1000) {
      throw new Error("Comments are too long (max 1000 characters)");
    }

    console.log("Submitting review:", { rating: rating, comments: comments, orderId });
    
    // Use the correct endpoint based on whether it's an edit or new review
    const endpoint = existingReview 
      ? `${orderId}/review` 
      : `${orderId}/review`;
    
    const method = existingReview ? 'put' : 'post';
    
    // Use the correct field names that match your API
    const reviewData = { 
      rating: rating,
      comments: comments.trim() 
    };
    
    const response = await api[method](endpoint, reviewData);

    if (response.status === 200 || response.status === 201) {
      toast.success(existingReview ? "Review updated successfully!" : "Thank you for your feedback!");
      
      // Create the review object to pass back to parent
      const submittedReview = {
        orderId: orderId,
        rating: rating,
        comments: comments.trim(),
        // Include any additional fields from the response if available
        ...response.data?.data,
        // Ensure we have the basic structure even if response doesn't include it
        id: response.data?.data?.id || response.data?.data?._id,
        createdAt: response.data?.data?.createdAt || new Date().toISOString(),
        updatedAt: response.data?.data?.updatedAt || new Date().toISOString(),
      };
      
      // Pass the review data back to the parent component
      onSubmitted?.(submittedReview);
      onClose();
    } else {
      throw new Error("Review submission failed");
    }
  } catch (error: any) {
    console.error("Review submission error:", error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      toast.error("Order not found. Please check your order ID.");
    } else if (error.response?.status === 400) {
      toast.error("Invalid review data. Please check your rating and comments.");
    } else if (error.response?.status === 409) {
      toast.error("Review already submitted for this order.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("Failed to submit review. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white rounded-t-xl sm:rounded-xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {existingReview ? "Edit Your Review" : "Rate Your Experience"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {existingReview 
                ? "Update your feedback for this delivery" 
                : "Help us improve by sharing your feedback"
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Order Information */}
          {orderInfo && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>#{orderInfo.orderNumber || orderId.slice(-8)}</span>
                </div>
                
                {orderInfo.itemCount && (
                  <div className="flex items-center gap-1.5" style={{color:"var(--text-gray-700)"}}>
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{orderInfo.itemCount} item(s)</span>
                  </div>
                )}
                
                {orderInfo.courierName && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{orderInfo.courierName}</span>
                  </div>
                )}
                
                {orderInfo.orderDate && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{new Date(orderInfo.orderDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating Stars */}
          <div className="text-center mb-5">
            <p className="text-gray-700 mb-3 font-medium text-sm">How was your delivery?</p>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= rating 
                        ? "text-amber-400 fill-amber-400" 
                        : "text-gray-300 hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rating === 5 ? "Excellent!" : 
                   rating === 4 ? "Great!" : 
                   rating === 3 ? "Good" : 
                   rating === 2 ? "Fair" : 
                   "Needs improvement"}
                </span>
                <p className="text-xs text-gray-500 mt-1.5">
                  You rated this delivery {rating} out of 5 stars
                </p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder-gray-400 transition-all"
              placeholder="Tell us about your experience with the delivery service..."
              value={comments || ""}
              onChange={(e) => setComments(e.target.value)}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                Share details about punctuality, professionalism, or overall service
              </span>
              <span className="text-xs text-gray-400">
                {(comments || "").length}/1000
              </span>
            </div>
          </div>

          {/* Error Message */}
          {submissionAttempted && rating === 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">
                Please select a rating before submitting your review.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                rating === 0 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : loading
                    ? "bg-emerald-400 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {existingReview ? "Update Review" : "Submit Review"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );}