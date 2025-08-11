import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
// import { UserPointsResponse, UserPointsType } from "@/types/user";
import api from "@/lib/axios";
import { getSocket } from "@/lib/socket";
// types/user.ts

// A single history entry for points earned or used
export interface UserPointsHistoryEntry {
  date: string; // ISO date string
  points: number;
  description: string;
}

// Pagination info for history or related lists
export interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

// Main type for user points data
export interface UserPointsType {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  pointsHistory: UserPointsHistoryEntry[];
  pagination: PaginationInfo;
  totalCompletedOrders?: number; // Optional — only present for buyers/customers
}

// API response for /users/:id/points
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0);

  const getUserPoints = useCallback(async () => {
    if (!userId) return;

    try {
      setPointsLoading(true);
      const res = await api.get<UserPointsResponse>(`/users/${userId}/points`);

      if (res.data.success) {
        setUserPoints(res.data.data);
        console.log("User points:", res.data.data);
      }
    } catch (err) {
      console.error("Error fetching user points:", err);
      // Fallback data
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
    } finally {
      setPointsLoading(false);
    }
  }, [userId, name, email]);
  const fetchCompletedOrdersCount = useCallback(async () => {
    try {
      const res = await api.get("/orders?status=completed&limit=1");
      setTotalCompletedOrders(res.data.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch completed orders count:", error);
    }
  }, []);
  // Auto-fetch points on mount or when userId changes
  useEffect(() => {
    console.log("😜😜😜😜😜POINTS😜😜😜😜😜");
    console.log(userId);
    if (userId) {
      getUserPoints();
    }
  }, [userId, getUserPoints]);

  // Fetch total completed orders count if user is a customer
  useEffect(() => {
    console.log("😜😜😜😜😜ORDERS😜😜😜😜😜");

    if (role === "customer" && token) {
      fetchCompletedOrdersCount();
    }
  }, [role, token, fetchCompletedOrdersCount]);

  useEffect(() => {
    const socket = getSocket();
    console.log("Socket instance in useEffect:", socket);

    if (!userId) {
      console.log("No userId, skipping socket listener setup");
      return;
    }
    if (!socket) {
      console.log("No socket instance, skipping listener setup");
      return;
    }

    socket.on("points:updated", (data) => {
      console.log("Received points:updated event:", data);
      setUserPoints((prev) =>
        prev ? { ...prev, totalPoints: data.totalPoints } : prev
      );
    });

    return () => {
      socket.off("points:updated");
    };
  }, [userId]);

  const updateUserPoints = useCallback((updates: Partial<UserPointsType>) => {
    setUserPoints((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const clearUserPoints = useCallback(() => {
    setUserPoints(null);
    setHasInitialized(false);
    setTotalCompletedOrders(0);
  }, []);

  const value = {
    userPoints,
    pointsLoading,
    totalCompletedOrders,
    getUserPoints,
    updateUserPoints,
    clearUserPoints,
    fetchCompletedOrdersCount,
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
