// useUserPointsSocket.ts - Updated for pagination
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import {
  UserPointsHistoryEntry,
  UserPointsType,
} from "@/context/UserPointsContext";

interface UseUserPointsSocketProps {
  userId?: string;
  enabled?: boolean;
}

interface PointsUpdatePayload {
  userId: string;
  totalPoints: number;
  pointsChange: number;
  bonusPoints?: number;
  totalPointsHistoryLength: number;
  reason: string;
  timestamp: string;
  totalCompletedOrders: number;
  pointsHistory: Array<{
    _id;
    points: number;
    type: string;
    reason: string;
    timestamp: string;
    orderId?: string;
  }>;
}

export const useUserPointsSocket = ({
  userId,
  enabled = true,
}: UseUserPointsSocketProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    const socket = getSocket();
    if (!socket) return;

    const handlePointsUpdated = (payload: PointsUpdatePayload) => {
      if (payload.userId !== userId) return;

      console.log(
        "🔔 Real-time points update - Full length:",
        payload.totalPointsHistoryLength,
        "Latest items:",
        payload.pointsHistory.length
      );

      // Convert the payload pointsHistory to match UserPointsHistoryEntry format
      const convertedPointsHistory: UserPointsHistoryEntry[] =
        payload.pointsHistory.map((item) => ({
          date: item.timestamp,
          points: item.points,
          description: item.reason,
          type: item.type,
          ...(item.orderId && { orderId: item.orderId }),
        }));

      // Update the user points cache
      queryClient.setQueryData(
        ["user-points", userId],
        (oldData: UserPointsType | undefined) => {
          if (!oldData) {
            return {
              userId,
              name: "",
              email: "",
              totalPoints: payload.totalPoints,
              pointsHistory: convertedPointsHistory, // Only latest items
              totalCompletedOrders: payload.totalCompletedOrders,
              totalPointsHistoryLength: payload.totalPointsHistoryLength,
              pagination: {
                currentPage: 1,
                totalItems: payload.totalPointsHistoryLength,
                totalPages: Math.ceil(payload.totalPointsHistoryLength / 10),
                hasMore: payload.totalPointsHistoryLength > 10,
              },
            };
          }

          // For existing data, we want to:
          // 1. Keep the pagination state (current page, etc.)
          // 2. Update total points and completed orders
          // 3. Update the total length
          // 4. Only replace the history if we're on page 1, otherwise keep existing loaded items

          const isOnFirstPage = oldData.pagination.currentPage === 1;

          return {
            ...oldData,
            totalPoints: payload.totalPoints,
            totalCompletedOrders: payload.totalCompletedOrders,
            totalPointsHistoryLength: payload.totalPointsHistoryLength,
            pointsHistory: isOnFirstPage
              ? convertedPointsHistory // Replace if on first page
              : oldData.pointsHistory, // Keep existing if on other pages
            pagination: {
              ...oldData.pagination,
              totalItems: payload.totalPointsHistoryLength,
              totalPages: Math.ceil(payload.totalPointsHistoryLength / 10),
              hasMore:
                oldData.pagination.currentPage <
                Math.ceil(payload.totalPointsHistoryLength / 10),
            },
          };
        }
      );

      // Update completed orders count
      queryClient.setQueryData(
        ["completed-orders", userId],
        payload.totalCompletedOrders
      );

      queryClient.invalidateQueries({
        queryKey: ["user-points", userId],
        refetchType: "none",
      });
    };

    socket.on("points:updated", handlePointsUpdated);
    socket.on("recycling:completed", handlePointsUpdated);

    return () => {
      socket.off("points:updated", handlePointsUpdated);
      socket.off("recycling:completed", handlePointsUpdated);
    };
  }, [userId, enabled, queryClient]);
};
