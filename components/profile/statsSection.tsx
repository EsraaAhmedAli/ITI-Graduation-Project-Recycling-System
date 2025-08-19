// components/profile/StatsSection.tsx
import React, { memo, Suspense } from "react";
import dynamic from "next/dynamic";
import StatBox from "./statBox";

const MembershipTier = dynamic(() => import("@/components/memberTireShip/memberTireShip").then(mod => ({ default: mod.default })), {
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded" />,
  ssr: false
});

interface StatsSectionProps {
  totalCompletedOrders: number;
  userPoints: any;
  pointsLoading: boolean;
  user: any;
  t: (key: string) => string;
}

const StatsSection = memo(function StatsSection({
  totalCompletedOrders,
  userPoints,
  pointsLoading,
  user,
  t
}: StatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
      <StatBox
        label={t("profile.stats.recycles")}
        value={totalCompletedOrders}
      />
      {user?.role !== "buyer" && (
        <StatBox
          label={t("profile.stats.points")}
          value={userPoints?.totalPoints}
          loading={pointsLoading}
        />
      )}
      {user.role === "customer" && (
        <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded" />}>
          <MembershipTier totalRecycles={totalCompletedOrders} />
        </Suspense>
      )}
    </div>
  );
});

export default StatsSection;