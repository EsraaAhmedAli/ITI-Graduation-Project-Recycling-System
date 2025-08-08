"use client";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { Star, SkipForward, Clock, CheckCircle, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function DeliveryReview({
  orderId,
  onSubmitted,
}: {
  orderId: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const router = useRouter();

  // Auto-redirect timer
  useEffect(() => {
    if (showReviewForm) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowReviewForm(false);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showReviewForm, router]);

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

      const response = await api.post(`/orders/${orderId}/review`, { 
        rating, 
        comments: comments.trim() 
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Thank you for your feedback!");
        onSubmitted();
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

  const handleSkip = () => {
    setShowReviewForm(false);
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Delivery Completed!
        </h1>
        <p className="text-gray-600 mb-4">Order #{orderId?.slice(-8) || orderId}</p>
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-lg font-semibold">
          Successfully Delivered
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Your Experience</h2>
            <p className="text-gray-600">Help us improve by sharing your feedback</p>
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mt-4 text-orange-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Auto-redirect in {timeLeft}s</span>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex justify-center space-x-2 mb-6">
            {[1,2,3,4,5].map(n => (
              <Star
                key={n}
                className={`w-10 h-10 cursor-pointer transition-colors duration-200 ${
                  n <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
                onClick={() => setRating(n)}
              />
            ))}
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Tell us about your experience..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={1000}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-gray-500">
                {comments.length}/1000 characters
              </span>
            </div>
          </div>

          {/* Error Message */}
          {submissionAttempted && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                If you&apos;re having trouble submitting, you can skip the review and submit it later from your profile.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleSubmit} 
              disabled={loading || rating === 0} 
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
            
            <Button 
              onClick={handleSkip}
              className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip Review
            </Button>
          </div>
        </div>
      )}

      {/* Thank You Message */}
      {!showReviewForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">
            Your order has been completed successfully. Redirecting to home page...
          </p>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
        </div>
        
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-medium">#{orderId?.slice(-8) || orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium text-green-600">Completed</span>
          </div>
          <div className="flex justify-between">
            <span>Completion Time:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
