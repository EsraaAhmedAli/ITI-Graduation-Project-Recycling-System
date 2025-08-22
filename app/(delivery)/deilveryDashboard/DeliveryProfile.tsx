"use client";
import { use, useCallback, useEffect, useState } from "react";
import { Star, Truck, Award, Shield, Pencil } from "lucide-react";
import { Loader } from '@/components/common'
import { useUserAuth } from "@/context/AuthFormContext";
import api from "@/lib/axios";
import Image from "next/image";
import Pagination from "@/components/common/Pagintaion";
import { useLanguage } from "@/context/LanguageContext";

interface Review {
  id: string;
  stars: number;
  comment: string;
  reviewedAt: string;
  customerName: string;
  orderDate: string;
}

interface Courier {
  id: string;
  name: string;
  averageRating: number;
  totalReviews: number;
  totalDeliveries?: number;
  onTimeRate?: number;
  averageDeliveryTime?: number;
}

interface PaginatedReviews {
  courier: Courier;
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const CourierProfile = ({ setEdit }) => {
  const [data, setData] = useState<PaginatedReviews | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { user } = useUserAuth();
  const { t, locale, convertNumber } = useLanguage();

  const fetchReviews = useCallback(
    async (page: number) => {
      // console.log("inside fetchFUN");
      // console.log(user);
      // console.log("USER EXIST");

      setLoading(true);
      const id = user._id || user.id;
      try {
        const res = await api.get(
          `/reviews/courier/${id}?page=${page}&limit=${itemsPerPage}`
        );
        console.log(res);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching courier reviews", err);
      } finally {
        setLoading(false);
      }
    },
    [user] // dependencies
  );

  // Fetch every time page changes
  useEffect(() => {
    console.log(`FETCHING AGAIN...FROM....${currentPage}`);
    fetchReviews(currentPage);
  }, [fetchReviews, currentPage]);

  if (loading || !data || !user) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Modern Courier Header */}
        <DeliveryHeader
          attachments={user?.attachments}
          courier={data?.courier}
          setEdit={setEdit}
        />

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("profile.delivery.customer_reviews")}{" "}
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-semibold">
                {convertNumber(data.pagination.totalReviews)}
              </span>
              <span className="text-sm text-gray-500">
                {t("profile.delivery.total_reviews")}
              </span>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {data.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200 flex justify-between items-start"
              >
                {/* Comment on the left */}
                <p className="text-gray-700 leading-relaxed flex-1 mr-4">
                  {review.comment || t("profile.delivery.no_comment")}
                </p>

                {/* Stars on the right */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.stars
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Modern Pagination */}
          <Pagination
            pagination={{
              currentPage,
              totalPages: data.pagination.totalPages,
              hasNextPage: currentPage < data.pagination.totalPages,
              hasPreviousPage: currentPage > 1,
            }}
            onPageChange={setCurrentPage}
            pageGroupSize={3} // optional, default = 5
          />
        </div>
      </div>
    </div>
  );
};

export default CourierProfile;

const DeliveryHeader = ({ attachments, courier, setEdit }) => {
  const { t, locale, convertNumber } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
      <div
        className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 ${
          locale === "ar" ? "rtl" : ""
        }`}
      >
        {/* LEFT: Avatar + Info */}
        <div
          className={`flex items-center ${
            locale === "ar" ? "space-x-reverse space-x-6" : "space-x-6"
          }`}
        >
          {/* Avatar */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-4 border-white">
              <Image
                src={attachments.deliveryImage}
                alt={courier.name}
                className="w-full h-full object-cover"
                width={80}
                height={80}
              />
            </div>
            <div
              className={`absolute -bottom-2 ${
                locale === "ar" ? "-left-2" : "-right-2"
              } w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg border-2 border-white animate-pulse hover:animate-none`}
            >
              <Award className="text-white w-5 h-5" />
            </div>
          </div>

          {/* Name + Verified + Rating */}
          <div>
            <div
              className={`flex items-center mb-1 ${
                locale === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <h1 className="text-2xl font-bold text-gray-900">
                {courier.name}
              </h1>
              <div
                className={`flex items-center bg-green-50 px-3 py-0.5 rounded-full ${
                  locale === "ar" ? "mr-2" : "ml-2"
                }`}
              >
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-semibold text-sm">
                  {t("profile.delivery.verified_courier")}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div
              className={`flex items-center bg-yellow-50 px-3 py-1 rounded-full w-fit ${
                locale === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-bold text-yellow-700">
                {convertNumber(courier.averageRating.toFixed(1))}
              </span>
              <span className="text-yellow-600 text-sm">
                ({convertNumber(courier.totalReviews)})
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Deliveries + Button */}
        <div
          className={`flex items-center gap-6 ${
            locale === "ar" ? "flex-row-reverse" : ""
          }`}
        >
          {/* Deliveries Stat */}
          <div
            className={`flex gap-2 items-center text-center ${
              locale === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-1">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {convertNumber(courier.totalReviews)}
            </div>
            <div className="text-xs text-gray-500">
              {t("profile.delivery.deliveries")}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setEdit(true)}
            className={`flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-full hover:bg-green-50 hover:shadow-md transition-all duration-200 ${
              locale === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            <Pencil size={16} />
            <span className="font-medium">
              {t("profile.delivery.edit_profile")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
