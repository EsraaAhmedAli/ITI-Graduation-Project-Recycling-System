// hooks/useReviews.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserAuth } from "@/context/AuthFormContext";
import api from "@/lib/axios";
import { Review } from "@/components/profile/ReviewTabs";

interface UseReviewsOptions {
  enabled?: boolean;
}

export function useReviews({ enabled = true }: UseReviewsOptions = {}) {
  const { user, token } = useUserAuth();
  const queryClient = useQueryClient();

  const fetchUserReviews = async (): Promise<Review[]> => {
    if (!user || !token) {
      return [];
    }

    try {
      const response = await api.get("/reviews/my-reviews", {
        params: {
          page: 1,
          limit: 50
        }
      });
      return response.data.reviews || [];
    } catch (error) {
      console.error("Failed to fetch user reviews:", error);
      throw error; // Let react-query handle the error
    }
  };

  const {
    data: userReviews = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-reviews", user?._id], // Include user ID for cache invalidation
    queryFn: fetchUserReviews,
    enabled: enabled && !!(user && token), // Only run query when enabled AND user is authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnMount: true,
    retry: 2, // Retry failed requests 2 times
    onError: (error) => {
      console.error("Error fetching user reviews:", error);
    },
  });

  const findReviewForOrder = (orderId: string): Review | null => {
    return userReviews.find(review => review.orderId === orderId) || null;
  };

  // Helper function to invalidate and refetch reviews
  const invalidateReviews = () => {
    queryClient.invalidateQueries({
      queryKey: ["user-reviews"]
    });
    // Also invalidate any individual order review queries
    queryClient.invalidateQueries({
      queryKey: ["/api/orders"],
      predicate: (query) => {
        return query.queryKey.includes("review");
      }
    });
  };

  // Helper function to update a specific review in the cache
  const updateReviewInCache = (orderId: string, updatedReview: Review) => {
    queryClient.setQueryData(["user-reviews", user?._id], (oldData: Review[] = []) => {
      return oldData.map(review => 
        review.orderId === orderId ? updatedReview : review
      );
    });
    
    // Also update the individual order review cache if it exists
    queryClient.setQueryData(["/api/orders", orderId, "review"], updatedReview);
  };

  // Helper function to add a new review to the cache
  const addReviewToCache = (newReview: Review) => {
    queryClient.setQueryData(["user-reviews", user?._id], (oldData: Review[] = []) => {
      return [newReview, ...oldData];
    });
    
    // Also set the individual order review cache
    queryClient.setQueryData(["/api/orders", newReview.orderId, "review"], newReview);
  };

  // Helper function to remove a review from the cache
  const removeReviewFromCache = (orderId: string) => {
    queryClient.setQueryData(["user-reviews", user?._id], (oldData: Review[] = []) => {
      return oldData.filter(review => review.orderId !== orderId);
    });
    
    // Also remove from individual order review cache
    queryClient.removeQueries(["/api/orders", orderId, "review"]);
  };

  return {
    userReviews,
    isLoading,
    isError,
    error,
    refetch,
    findReviewForOrder,
    invalidateReviews,
    updateReviewInCache,
    addReviewToCache,
    removeReviewFromCache,
  };
}