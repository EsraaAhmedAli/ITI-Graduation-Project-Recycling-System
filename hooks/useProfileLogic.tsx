// components/profile/hooks/useProfileLogic.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useOrders from "@/hooks/useGetOrders";
import { rewardLevels } from "@/constants/rewardsTiers";
import { getSocket } from "@/lib/socket";
import { useUserPoints } from "@/context/UserPointsContext";

interface UseProfileLogicProps {
  activeTab: string;
  user: any;
  // totalCompletedOrders: number;
}

export function useProfileLogic({
  activeTab,
  user,
}: UseProfileLogicProps) {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  const{totalPointsHistoryLength:totalCompletedOrders}=useUserPoints()

  // Memoized status parameter
  const statusParam = useMemo(() => {
    const statusMap: Record<string, string> = {
      incoming: "incoming",
      completed: "completed",
      cancelled: "cancelled",
    };
    return statusMap[activeTab] || "";
  }, [activeTab]);

  // Orders hook with optimized parameters
  const {
    allOrders,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleCancelOrder: hookHandleCancelOrder,
    refetch,
  } = useOrders({
    limit: 6,
    status: statusParam,
  });

  // Optimized load more
  const loadMoreOrders = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Enhanced refresh after recycling
  const handleRecyclingPointsUpdate = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
    } catch (error) {
      console.error("Failed to refresh after recycling:", error);
    }
  }, [queryClient]);

  // Optimized cancel order function
  const handleCancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await hookHandleCancelOrder(orderId);
        await refetch();
      } catch (error) {
        console.error("Failed to cancel order:", error);
      }
    },
    [hookHandleCancelOrder, refetch]
  );

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    if (user?.role === "buyer") {
      return allOrders.filter((order) => order.status !== "cancelled");
    }
    return allOrders;
  }, [allOrders, user?.role]);

  // Memoized tabs
  const tabs = useMemo(() => {
    const baseTabs = ["incoming", "completed"];

    if (user?.role === "buyer") {
      baseTabs.push("payments");
    } else {
      baseTabs.push("cancelled");
    }

    if (user?.role === "customer" || user?.role === "buyer") {
      baseTabs.push("reviews");
    }

    return baseTabs;
  }, [user?.role]);

  // Memoized tier
  const tier = useMemo(() => {
    return rewardLevels.find(
      (tier) =>
        totalCompletedOrders >= tier.minRecycles &&
        totalCompletedOrders <= tier.maxRecycles
    );
  }, [totalCompletedOrders]);

  const shouldShowSeeMore = hasNextPage && filteredOrders.length >= 6;

  // Optimized socket listeners - only set up once and use refs
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    isMountedRef.current = true;

    // Move the callback definition outside of useEffect or use useCallback at the top level
    const handleSocketEvent = (data: any) => {
      if (!isMountedRef.current) return;

      // Batch updates with requestAnimationFrame
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;

        queryClient.invalidateQueries({
          queryKey: ["orders"],
          exact: false,
          refetchType: "active", // Only refetch active queries
        });

        // Only refetch if the tab is relevant to the event
        if (data.status === "completed" && activeTab === "completed") {
          setTimeout(() => refetch(), 300);
        } else if (activeTab === "incoming") {
          setTimeout(() => refetch(), 200);
        }
      });
    };

    // Single generic handler for all order events
    socket.on("order:status:updated", handleSocketEvent);
    socket.on("order:completed", handleSocketEvent);
    socket.on("recycling:completed", handleSocketEvent);

    return () => {
      isMountedRef.current = false;
      socket.off("order:status:updated", handleSocketEvent);
      socket.off("order:completed", handleSocketEvent);
      socket.off("recycling:completed", handleSocketEvent);
    };
  }, [queryClient, refetch, activeTab]);

  return {
    allOrders,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    tier,
    tabs,
    filteredOrders,
    shouldShowSeeMore,
    loadMoreOrders,
    handleCancelOrder,
    handleRecyclingPointsUpdate,
  };
}
