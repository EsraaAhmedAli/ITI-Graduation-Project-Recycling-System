// components/profile/OrderCard.tsx
import React, { memo, useCallback } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import StatusBadge from "./statusBadge";

const OrderActions = dynamic(() => import("@/components/profile/OrderActions"), {
  loading: () => <div className="animate-pulse h-8 bg-gray-200 rounded" />,
  ssr: false
});

interface OrderCardProps {
  order: any;
  user: any;
  userReviews: any[];
  onViewDetails: (items: any[], orderStatus: string, order: any) => void;
  onRateOrder: (order: any) => void;
  onCancelOrder: (orderId: string) => void;
  onNavigate: (orderId: string) => void;
  t: (key: string) => string;
}

const OrderCard = memo(function OrderCard({
  order,
  user,
  userReviews,
  onViewDetails,
  onRateOrder,
  onCancelOrder,
  onNavigate,
  t,
}: OrderCardProps) {
  const handleNavigate = useCallback(() => {
    onNavigate(order._id);
  }, [onNavigate, order._id]);

  return (
    <div className="rounded-xl p-5 bg-gradient-to-br from-green-50 to-white shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:cursor-pointer">
      {/* Header with Order Info */}
      <div
        onClick={handleNavigate}
        className="flex justify-between items-start mb-4"
      >
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-1">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs">
            {t("profile.orders.date")}:{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} t={t} />
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-1">{t('address.pickupAddress')}</p>
          <p className="text-xs leading-relaxed">
            {order.address.street}, Bldg {order.address.building}, Floor{" "}
            {order.address.floor}, {order.address.area}, {order.address.city}
          </p>
        </div>
      </div>

      {/* Order Actions */}
      <OrderActions
        order={order}
        userRole={user?.role}
        userReviews={userReviews}
        onViewDetails={onViewDetails}
        onRateOrder={onRateOrder}
        onCancelOrder={onCancelOrder}
      />
    </div>
  );
});

export default OrderCard;