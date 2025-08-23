import React, { createContext, useContext, useCallback } from "react";
import api from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserPointsSocket } from "@/hooks/useUserPointsSocket";
import { PointsEntry } from "@/components/Types/points.type";

// Types remain the same
export interface UserPointsHistoryEntry {
  date: string;
  points: number;
  description: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UserPointsType {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  pointsHistory: PointsEntry[];
  pagination: PaginationInfo;
  totalCompletedOrders?: number;
  totalPointsHistoryLength?: number;
}

export interface UserPointsResponse {
  success: boolean;
  data: UserPointsType;
}

interface UserPointsContextType {
  userPoints: UserPointsType | null;
  pointsLoading: boolean;
  totalCompletedOrders: number;
  refreshUserPoints: () => Promise<void>;
  updateUserPoints: (points: Partial<UserPointsType>) => void;
  clearUserPoints: () => void;
  totalPointsHistoryLength?: number;
}

const UserPointsContext = createContext<UserPointsContextType | undefined>(
  undefined
);

interface UserPointsProviderProps {
  children: React.ReactNode;
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  token?: string;
}

export function UserPointsProvider({
  children,
  userId,
  name,
  email,
  role,
  token,
}: UserPointsProviderProps) {
  const queryClient = useQueryClient();

  // Check if user is a customer
  const isCustomer = role === "customer";

  // Fetch user points with React Query - only for customers
  const {
    data: userPoints,
    isLoading: pointsLoading,
    refetch: refetchPoints,
  } = useQuery({
    queryKey: ["user-points", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");

      const res = await api.get<UserPointsResponse>(`/users/${userId}/points`);
      if (!res.data.success) throw new Error("Failed to fetch user points");

      return res.data.data;
    },
    enabled: !!userId && isCustomer, // Only enabled for customers
    staleTime: Infinity, // Never consider stale
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Fetch completed orders count with React Query - only for customers
  const { data: totalCompletedOrders = 0 } = useQuery({
    queryKey: ["completed-orders", userId],
    queryFn: async () => {
      if (!userId) return 0;

      const res = await api.get("/orders?status=completed&limit=1");
      return res.data.totalCount || 0;
    },
    enabled: !!userId, // Only enabled for customers
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Set up socket for real-time updates - only for customers
  useUserPointsSocket({
    userId,
    enabled: !!userId && isCustomer, // Only enabled for customers
  });

  const refreshUserPoints = useCallback(async () => {
    // Only refresh if user is a customer
    if (!isCustomer) return;

    await Promise.allSettled([
      refetchPoints(),
      queryClient.invalidateQueries({ queryKey: ["completed-orders", userId] }),
    ]);
  }, [refetchPoints, queryClient, userId, isCustomer]);

  const updateUserPoints = useCallback(
    (updates: Partial<UserPointsType>) => {
      // Only update if user is a customer
      if (!userId || !isCustomer) return;

      // Optimistically update the cache
      queryClient.setQueryData(
        ["user-points", userId],
        (oldData: UserPointsType | undefined) => {
          if (!oldData) return undefined;
          return { ...oldData, ...updates };
        }
      );
    },
    [queryClient, userId, isCustomer]
  );

  const clearUserPoints = useCallback(() => {
    if (userId && isCustomer) {
      queryClient.removeQueries({ queryKey: ["user-points", userId] });
      queryClient.removeQueries({ queryKey: ["completed-orders", userId] });
    }
  }, [queryClient, userId, isCustomer]);

  const value = {
    userPoints: isCustomer ? userPoints || null : null,
    pointsLoading: isCustomer ? pointsLoading : false,
    totalCompletedOrders: totalCompletedOrders,
    refreshUserPoints,
    updateUserPoints,
    clearUserPoints,
    totalPointsHistoryLength: isCustomer
      ? userPoints?.pagination.totalItems
      : undefined,
  };

  return (
    <UserPointsContext.Provider value={value}>
      {children}
    </UserPointsContext.Provider>
  );
}

export function useUserPoints() {
  const context = useContext(UserPointsContext);

  if (context === undefined) {
    throw new Error("useUserPoints must be used within a UserPointsProvider");
  }

  return context;
}
