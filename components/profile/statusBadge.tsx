// components/profile/StatusBadge.tsx
import React, { memo, useMemo } from "react";
import {
  CheckCircle,
  Clock1,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  t: (key: string) => string;
}

const StatusBadge = memo(function StatusBadge({
  status,
  t,
}: StatusBadgeProps) {
  const statusConfig = useMemo(() => {
    const configs = {
      assigntocourier: {
        icon: <Truck size={14} />,
        className: "bg-yellow-100 text-yellow-800",
        text: t("profile.orders.status.inTransit"),
      },
      pending: {
        icon: <Clock1 size={14} />,
        className: "bg-orange-100 text-orange-800",
        text: t("profile.orders.status.pending"),
      },
      collected: {
        icon: <Package size={14} />,
        className: "bg-blue-100 text-blue-800",
        text: t("profile.orders.status.collected") || "Collected",
      },
      completed: {
        icon: <CheckCircle size={14} />,
        className: "bg-green-100 text-green-800",
        text: t("profile.orders.status.completed"),
      },
      cancelled: {
        icon: <XCircle size={14} />,
        className: "bg-red-100 text-red-800",
        text: t("profile.orders.status.cancelled"),
      },
    };

    return configs[status as keyof typeof configs];
  }, [status, t]);

  if (!statusConfig) return null;

  return (
    <div
      className={`flex items-center gap-1 ${statusConfig.className} px-3 py-1 rounded-full text-xs font-medium`}
    >
      {statusConfig.icon}
      {statusConfig.text}
    </div>
  );
});

export default StatusBadge;