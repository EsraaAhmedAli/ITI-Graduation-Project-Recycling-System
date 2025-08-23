import React, { useState } from "react";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { User, Star, Calendar, MessageSquare, X } from "lucide-react";
import { Modal, ModalBody } from "flowbite-react";
import { useLanguage } from "@/context/LanguageContext";
import Pagination from "./common/Pagintaion";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courierId: string;
  courierName: string;
}

export default function ReviewsModal({
  isOpen,
  onClose,
  courierId,
  courierName,
}: ReviewsModalProps) {
  const [page, setPage] = useState(1);
  const { t, convertNumber } = useLanguage();

  // Helper function for pluralization
  const pluralize = (count: number, singular: string, plural: string) => {
    return count === 1 ? singular : plural;
  };

  const RatingDisplay = ({
    rating,
    totalReviews,
    size = "sm",
  }: {
    rating: number;
    totalReviews: number;
    size?: "sm" | "md" | "lg";
  }) => {
    const starSize =
      size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3 h-3";
    const textSize =
      size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";

    if (totalReviews === 0) {
      return (
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`${starSize} text-gray-300`} />
            ))}
          </div>
          <span className={`${textSize} text-gray-500 ml-1`}>
            {t("reviews.noReviews")}
          </span>
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
          {convertNumber(rating.toFixed(1))}
        </span>
        <span className={`${textSize} text-gray-500`}>
          ({convertNumber(totalReviews)}{" "}
          {pluralize(
            totalReviews,
            t("reviews.reviewSingular"),
            t("reviews.reviewPlural")
          )}
          )
        </span>
      </div>
    );
  };

  const fetchReviews = async ({ queryKey }: any) => {
    const [, courierId, page] = queryKey;
    const res = await api.get(
      `/reviews/courier/${courierId}?page=${page}&limit=3`
    );
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courier-reviews", courierId, page],
    queryFn: fetchReviews,
    enabled: isOpen && !!courierId,
    staleTime: 2000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unused

    onError: () => {
      toast.error(t("reviews.loadError"));
    },
  });

  const reviews = data?.reviews || [];
  const courierStats = {
    averageRating: data?.courier?.averageRating || 0,
    totalReviews: data?.courier?.totalReviews || 0,
  };

  // Transform pagination data to match your Pagination component interface
  const paginationData = {
    currentPage: data?.pagination?.currentPage || page,
    totalPages: data?.pagination?.totalPages || 1,
    hasNextPage: data?.pagination?.hasNext || false,
    hasPreviousPage: data?.pagination?.hasPrev || false,
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const handleClose = () => {
    setPage(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal dismissible show={isOpen} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center gap-3 flex-1 pr-4">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("reviews.title", { courierName })}
            </h3>
            <RatingDisplay
              rating={courierStats.averageRating}
              totalReviews={courierStats.totalReviews}
              size="md"
            />
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 flex-shrink-0"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ModalBody className="p-0">
        <div className="p-6 pb-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              {t("reviews.loadError")}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">{t("reviews.noReviewsYet")}</p>
              <p className="text-sm">{t("reviews.noReviewsDescription")}</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {reviews.map((review: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.customerName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.stars
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {convertNumber(review.stars)}{" "}
                            {pluralize(
                              review.stars,
                              t("reviews.starSingular"),
                              t("reviews.starPlural")
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.reviewedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t("reviews.orderDate")}:{" "}
                        {new Date(review.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <div className="pl-13">
                      <p className="text-sm text-gray-700 italic">
                        {review.comment}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Use your custom Pagination component */}
        {!isLoading && !isError && reviews.length > 0 && (
          <Pagination
            onPageChange={handlePageChange}
            pagination={paginationData}
            pageGroupSize={3}
          />
        )}
      </ModalBody>
    </Modal>
  );
}
