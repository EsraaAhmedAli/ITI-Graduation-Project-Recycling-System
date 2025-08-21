import React, { memo, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import StatBox from "./statBox";

// Preload the component immediately with optimized loading
const MembershipTier = dynamic(
  () => import("@/components/memberTireShip/memberTireShip"),
  {
    loading: () => (
      <div
        className="animate-pulse h-20 bg-gray-200 rounded"
        role="status"
        aria-label="Loading membership tier"
      />
    ),
    ssr: false,
  }
);

interface StatsSectionProps {
  totalCompletedOrders: number;
  userPoints: {
    totalPoints?: number;
  } | null;
  pointsLoading: boolean;
  user: {
    role: string;
  };
  t: (key: string) => string;
}

// Pre-defined grid class combinations to avoid runtime template literals
const GRID_CLASSES = {
  "1": "grid-cols-1 md:grid-cols-1",
  "2": "grid-cols-1 md:grid-cols-2",
  "3": "grid-cols-1 md:grid-cols-3",
} as const;

// Preload the component on client side after hydration
if (typeof window !== "undefined") {
  // Use requestIdleCallback to preload when browser is idle
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      import("@/components/memberTireShip/memberTireShip").catch(() => {
        console.warn("Failed to preload MembershipTier component");
      });
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      import("@/components/memberTireShip/memberTireShip").catch(() => {
        console.warn("Failed to preload MembershipTier component");
      });
    }, 1000);
  }
}

const StatsSection = memo(
  function StatsSection({
    totalCompletedOrders,
    userPoints,
    pointsLoading,
    user,
    t,
  }: StatsSectionProps) {
    // Memoize expensive computations
    const { isNotBuyer, isCustomer, totalPoints, labels, gridClass } =
      useMemo(() => {
        const role = user?.role;
        const isNotBuyer = role !== "buyer";
        const isCustomer = role === "customer";
        const totalPoints = userPoints?.totalPoints || 0;

        // Pre-translate labels once
        const labels = {
          recycles: t("profile.stats.recycles"),
          points: t("profile.stats.points"),
        };

        // Calculate grid columns with deterministic class selection
        let colCount = 1; // Always at least recycles
        if (isNotBuyer) colCount++;
        if (isCustomer) colCount++;

        // Use pre-defined classes instead of template literals
        const gridClass =
          GRID_CLASSES[
            Math.min(colCount, 3) as unknown as keyof typeof GRID_CLASSES
          ];
        return { isNotBuyer, isCustomer, totalPoints, labels, gridClass };
      }, [user?.role, userPoints?.totalPoints, t]);

    // Memoize stat boxes to prevent unnecessary re-renders
    const statBoxes = useMemo(() => {
      const boxes = [
        <StatBox
          key="recycles"
          label={labels.recycles}
          value={totalCompletedOrders}
        />,
      ];

      if (isNotBuyer) {
        boxes.push(
          <StatBox
            key="points"
            label={labels.points}
            value={totalPoints}
            loading={pointsLoading}
          />
        );
      }

      return boxes;
    }, [isNotBuyer, labels, totalCompletedOrders, totalPoints, pointsLoading]);

    return (
      <div className={`grid ${gridClass} gap-4 text-center`}>
        {statBoxes}

        {/* Membership tier - shown for customers only with optimized suspense */}
        {isCustomer && (
          <Suspense
            fallback={
              <div
                className="animate-pulse h-20 bg-gray-200 rounded"
                role="status"
                aria-label="Loading membership tier"
              />
            }
          >
            <MembershipTier totalRecycles={totalCompletedOrders} />
          </Suspense>
        )}
      </div>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.totalCompletedOrders === nextProps.totalCompletedOrders &&
      prevProps.userPoints?.totalPoints === nextProps.userPoints?.totalPoints &&
      prevProps.pointsLoading === nextProps.pointsLoading &&
      prevProps.user?.role === nextProps.user?.role &&
      prevProps.t === nextProps.t
    );
  }
);

StatsSection.displayName = "StatsSection";

export default StatsSection;
