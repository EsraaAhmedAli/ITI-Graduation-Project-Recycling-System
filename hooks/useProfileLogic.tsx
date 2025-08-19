// components/profile/hooks/useProfileLogic.ts
import { useState, useEffect, useCallback, useMemo, startTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useOrders from "@/hooks/useGetOrders";
import { rewardLevels } from "@/constants/rewardsTiers";
import { getSocket } from "@/lib/socket";
import { useDebounce } from "./useDebounce";

interface UseProfileLogicProps {
  activeTab: string;
  user: any;
  totalCompletedOrders: number;
  silentRefresh: () => void;
}

export function useProfileLogic({
  activeTab,
  user,
  totalCompletedOrders,
  silentRefresh
}: UseProfileLogicProps) {
  const queryClient = useQueryClient();

  // Memoized status parameter
  const statusParam = useMemo(() => {
    const statusMap: Record<string, string> = {
      incoming: "incoming",
      completed: "completed", 
      cancelled: "cancelled"
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

  // Debounced refresh function
  const debouncedRefresh = useDebounce(() => {
    if (!document.hidden) {
      silentRefresh();
      refetch();
    }
  }, 300);

  // Optimized load more with virtual scrolling consideration
  const loadMoreOrders = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      startTransition(() => {
        fetchNextPage();
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Enhanced refresh after recycling
  const handleRecyclingPointsUpdate = useCallback(async () => {
    try {
      await Promise.all([
        silentRefresh(),
        queryClient.invalidateQueries({ queryKey: ["orders"] })
      ]);
      
      requestIdleCallback(() => refetch(), { timeout: 2000 });
    } catch (error) {
      console.error("Failed to refresh after recycling:", error);
    }
  }, [silentRefresh, queryClient, refetch]);

  // Optimized cancel order function
  const handleCancelOrder = useCallback(async (orderId: string) => {
    try {
      await hookHandleCancelOrder(orderId);
      await Promise.all([refetch(), silentRefresh()]);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  }, [hookHandleCancelOrder, refetch, silentRefresh]);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    if (user?.role === "buyer") {
      return allOrders.filter(order => order.status !== "cancelled");
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
    return rewardLevels.find(tier =>
      totalCompletedOrders >= tier.minRecycles &&
      totalCompletedOrders <= tier.maxRecycles
    );
  }, [totalCompletedOrders]);

  const shouldShowSeeMore = hasNextPage && filteredOrders.length >= 6;

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOrderStatusUpdate = (data: any) => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        
        if (data.status === "completed") {
          if (activeTab === "incoming") {
            refetch();
          } else if (activeTab === "completed") {
            setTimeout(() => refetch(), 300);
          }
        } else {
          refetch();
        }
      });
    };

    const handlePointsUpdate = (data: any) => {
      startTransition(() => {
        setTimeout(() => refetch(), 100);
      });
    };

    const handleRecyclingCompleted = (data: any) => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        
        if (activeTab === "incoming") {
          refetch();
        } else if (activeTab === "completed") {
          setTimeout(() => refetch(), 300);
        }
      });
    };

    socket.on("order:status:updated", handleOrderStatusUpdate);
    socket.on("points:updated", handlePointsUpdate);
    socket.on("recycling:completed", handleRecyclingCompleted);
    socket.on("order:completed", handleOrderStatusUpdate);

    return () => {
      socket.off("order:status:updated", handleOrderStatusUpdate);
      socket.off("points:updated", handlePointsUpdate);
      socket.off("recycling:completed", handleRecyclingCompleted);
      socket.off("order:completed", handleOrderStatusUpdate);
    };
  }, [queryClient, refetch, activeTab]);

  // Periodic refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        debouncedRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    if (isVisible) {
      const intervalTime = activeTab === "completed" ? 8000 : 
                          activeTab === "incoming" ? 12000 : 25000;

      interval = setInterval(() => {
        if (isVisible && !document.hidden) {
          silentRefresh();
          
          if (activeTab === "incoming" || activeTab === "completed") {
            refetch();
          }
        }
      }, intervalTime);
    }

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [silentRefresh, activeTab, refetch, debouncedRefresh]);

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