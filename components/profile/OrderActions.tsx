// components/profile/OrderActions.tsx
"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ReceiptLink } from "@/components/RecipetLink";

interface OrderActionsProps {
  order: any;
  userRole?: string;
  userReviews: any[];
  onViewDetails: (items: any[], status: string) => void;
  onRateOrder: (order: any) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function OrderActions({
  order,
  userRole,
  userReviews,
  onViewDetails,
  onRateOrder,
  onCancelOrder,
}: OrderActionsProps) {
  const { t } = useLanguage();
  
  const hasExistingReview = userReviews.find(
    (review) => review.orderId === order._id
  );

  const canRate = order.status === "completed" && 
                 (userRole === "customer" || userRole === "buyer");

  const canCancel = order.status === "pending" && userRole === "customer";

  const canTrack = [
    "assigntocourier",
    "pending", 
    "arrived",
    "collected"
  ].includes(order.status);

  const showReceipt = ["collected", "completed"].includes(order.status);

  return (
    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
      <div className="flex gap-3">
        {/* View Details */}
        <button
          onClick={() => onViewDetails(order.items, order.status,order)}
          className="text-sm text-green-600 hover:text-green-800 font-medium hover:underline transition-colors duration-200"
        >
          {t("profile.orders.viewDetails")}
        </button>

        {/* Receipt Link */}
        {showReceipt && (
          <ReceiptLink orderId={order._id} variant="compact" />
        )}

        {/* Tracking Link */}
        {canTrack && (
          <Link
            href={`/pickup/tracking/${order._id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
          >
            {
              t('profile.orders.track')
            }
          </Link>
        )}

        {/* Rate Order Button */}
        {canRate && (
          <button
            onClick={() => onRateOrder(order)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors duration-200 flex items-center gap-1"
          >
            <Star size={14} />
            {hasExistingReview ? t('profile.orders.editRate') : t('profile.orders.rate')}
          </button>
        )}
      </div>

      {/* Cancel Button */}
      {canCancel && (
        <button
          onClick={() => onCancelOrder(order._id)}
          className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-colors duration-200"
        >
          {t("profile.orders.cancelOrder")}
        </button>
      )}
    </div>
  );
}