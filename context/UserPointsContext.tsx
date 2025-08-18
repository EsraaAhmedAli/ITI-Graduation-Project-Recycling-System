import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import api from "@/lib/axios";
import { getSocket } from "@/lib/socket";

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
  pointsHistory: UserPointsHistoryEntry[];
  pagination: PaginationInfo;
  totalCompletedOrders?: number;
}

export interface UserPointsResponse {
  success: boolean;
  data: UserPointsType;
}

interface UserPointsContextType {
  userPoints: UserPointsType | null;
  pointsLoading: boolean;
  totalCompletedOrders: number;
  getUserPoints: () => Promise<void>;
  fetchCompletedOrdersCount: () => Promise<void>;
  updateUserPoints: (points: Partial<UserPointsType>) => void;
  clearUserPoints: () => void;
  refreshUserData: () => Promise<void>;
  // New: Silent refresh without loading states
  silentRefresh: () => Promise<void>;
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
  const [userPoints, setUserPoints] = useState<UserPointsType | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0);
  const [totalPointsHistoryLength, setTotalPointsHistoryLength] = useState(0);

  // Refs to track ongoing requests and prevent duplicate calls
  const pointsRequestRef = useRef<Promise<void> | null>(null);
  const ordersRequestRef = useRef<Promise<void> | null>(null);
  const lastFetchTime = useRef<number>(0);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const getUserPoints = useCallback(
    async (silent = false) => {
      if (!userId) return;

      // Check if request is already in progress
      if (pointsRequestRef.current) {
        return pointsRequestRef.current;
      }

      // Check cache validity for silent requests
      if (silent && Date.now() - lastFetchTime.current < CACHE_DURATION) {
        return;
      }

      const fetchPoints = async () => {
        try {
          if (!silent) setPointsLoading(true);

          const res = await api.get<UserPointsResponse>(
            `/users/${userId}/points`
          );
          setTotalPointsHistoryLength(res.data.data.pagination.totalItems);

          if (res.data.success) {
            setUserPoints((prev) => {
              // Only update if data actually changed to prevent unnecessary re-renders
              const newData = res.data.data;

              if (
                prev &&
                prev.totalPoints === newData.totalPoints &&
                prev.pointsHistory.length === newData.pointsHistory.length
              ) {
                return prev;
              }
              return newData;
            });
            lastFetchTime.current = Date.now();
            console.log("User points updated:", res.data.data);
          }
        } catch (err) {
          console.error("Error fetching user points:", err);
          // Only set fallback data if we don't have any existing data
          if (!userPoints) {
            setUserPoints({
              userId: userId || "",
              name: name || "",
              email: email || "",
              totalPoints: 0,
              pointsHistory: [],
              pagination: {
                currentPage: 1,
                totalItems: 0,
                totalPages: 0,
                hasMore: false,
              },
            });
          }
        } finally {
          if (!silent) setPointsLoading(false);
          pointsRequestRef.current = null;
        }
      };

      pointsRequestRef.current = fetchPoints();
      return pointsRequestRef.current;
    },
    [userId, name, email, userPoints]
  );

  const fetchCompletedOrdersCount = useCallback(async (silent = false) => {
    // Check if request is already in progress
    if (ordersRequestRef.current) {
      return ordersRequestRef.current;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders?status=completed&limit=1");
        const newCount = res.data.totalCount || 0;

        // Only update if count changed
        setTotalCompletedOrders((prev) =>
          prev === newCount ? prev : newCount
        );
      } catch (error) {
        if (!silent) {
          console.error("Failed to fetch completed orders count:", error);
        }
      } finally {
        ordersRequestRef.current = null;
      }
    };

    ordersRequestRef.current = fetchOrders();
    return ordersRequestRef.current;
  }, []);

  // Silent refresh function that doesn't show loading states
  const silentRefresh = useCallback(async () => {
    const promises = [getUserPoints(true)];

    if (role === "customer" && token) {
      promises.push(fetchCompletedOrdersCount(true));
    }

    await Promise.allSettled(promises); // Use allSettled to prevent one failure from affecting others
  }, [getUserPoints, fetchCompletedOrdersCount, role, token]);

  // Combined refresh function with loading states
  const refreshUserData = useCallback(async () => {
    const promises = [getUserPoints(false)];

    if (role === "customer" && token) {
      promises.push(fetchCompletedOrdersCount(false));
    }

    await Promise.allSettled(promises);
  }, [getUserPoints, fetchCompletedOrdersCount, role, token]);

  // Debounced refresh to prevent excessive calls
  const debouncedSilentRefresh = useCallback(() => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = setTimeout(() => {
      silentRefresh();
    }, 1000); // 1 second debounce
  }, [silentRefresh]);

  // Initial data fetch
  useEffect(() => {
    console.log("😜😜😜😜😜POINTS😜😜😜😜😜");
    console.log(userId);
    if (userId) {
      getUserPoints(false); // Initial load with loading state
    }
  }, [userId, getUserPoints]);

  // Initial orders fetch
  useEffect(() => {
    console.log("😜😜😜😜😜ORDERS😜😜😜😜😜");

    if (role === "customer" && token) {
      fetchCompletedOrdersCount(false); // Initial load
    }
  }, [role, token, fetchCompletedOrdersCount]);

  // Enhanced socket listeners with comprehensive real-time updates
  useEffect(() => {
    const socket = getSocket();
    console.log("Socket instance in useEffect:", socket);

    if (!userId || !socket) {
      console.log("No userId or socket, skipping socket listener setup");
      return;
    }

    // Optimized socket listeners with immediate updates
    const handlePointsUpdate = (data: any) => {
      console.log("Received points:updated event:", data);

      // Immediate UI update for better UX
      setUserPoints((prev) => {
        if (prev && prev.totalPoints !== data.totalPoints) {
          return { ...prev, totalPoints: data.totalPoints };
        }
        return prev;
      });

      // If points increased, likely means an order was completed - update recycles count
      if (data.totalPoints > (userPoints?.totalPoints || 0)) {
        setTotalCompletedOrders((prev) => prev + 1);
      }

      // Debounced full refresh to get complete data
      debouncedSilentRefresh();
    };

    const handleOrderCompleted = (data: any) => {
      console.log("Received order:completed event:", data);

      // Immediate update to completed orders count
      setTotalCompletedOrders((prev) => prev + 1);

      // Update points if provided in the event
      if (data.pointsEarned && userPoints) {
        setUserPoints((prev) =>
          prev
            ? {
                ...prev,
                totalPoints: prev.totalPoints + data.pointsEarned,
              }
            : prev
        );
      }

      // Debounced full refresh
      debouncedSilentRefresh();
    };

    const handleOrderStatusUpdate = (data: any) => {
      console.log("Received order:status:updated event:", data);
      if (data.status === "completed") {
        // Immediate update to completed orders count
        setTotalCompletedOrders((prev) => prev + 1);

        // Update points if provided
        if (data.pointsEarned && userPoints) {
          setUserPoints((prev) =>
            prev
              ? {
                  ...prev,
                  totalPoints: prev.totalPoints + data.pointsEarned,
                }
              : prev
          );
        }

        // Debounced full refresh
        debouncedSilentRefresh();
      }
    };

    // NEW: Handle recycling completion events
    const handleRecyclingCompleted = (data: any) => {
      console.log("Received recycling:completed event:", data);

      // Update points immediately
      if (data.pointsEarned && userPoints) {
        setUserPoints((prev) =>
          prev
            ? {
                ...prev,
                totalPoints: prev.totalPoints + data.pointsEarned,
              }
            : prev
        );
      }

      // Update completed orders count
      if (data.orderCompleted) {
        setTotalCompletedOrders((prev) => prev + 1);
      }

      // Debounced full refresh
      debouncedSilentRefresh();
    };

    socket.on("points:updated", handlePointsUpdate);
    socket.on("order:completed", handleOrderCompleted);
    socket.on("order:status:updated", handleOrderStatusUpdate);
    socket.on("recycling:completed", handleRecyclingCompleted);

    return () => {
      socket.off("points:updated", handlePointsUpdate);
      socket.off("order:completed", handleOrderCompleted);
      socket.off("order:status:updated", handleOrderStatusUpdate);
      socket.off("recycling:completed", handleRecyclingCompleted);

      // Cleanup timeout
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [userId, debouncedSilentRefresh, userPoints?.totalPoints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, []);

  // Optimized update function with shallow comparison
  const updateUserPoints = useCallback((updates: Partial<UserPointsType>) => {
    setUserPoints((prev) => {
      if (!prev) return null;

      // Shallow comparison to prevent unnecessary updates
      const hasChanges = Object.keys(updates).some(
        (key) =>
          prev[key as keyof UserPointsType] !==
          updates[key as keyof UserPointsType]
      );

      return hasChanges ? { ...prev, ...updates } : prev;
    });
  }, []);

  const clearUserPoints = useCallback(() => {
    setUserPoints(null);
    setTotalCompletedOrders(0);
    lastFetchTime.current = 0;

    // Cancel ongoing requests
    pointsRequestRef.current = null;
    ordersRequestRef.current = null;

    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }
  }, []);

  const value = {
    userPoints,
    pointsLoading,
    totalCompletedOrders,
    getUserPoints: () => getUserPoints(false),
    updateUserPoints,
    clearUserPoints,
    fetchCompletedOrdersCount: () => fetchCompletedOrdersCount(false),
    refreshUserData,
    silentRefresh,
    totalPointsHistoryLength,
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
