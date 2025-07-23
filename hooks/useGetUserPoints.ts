import { UserPointsResponse } from '@/types/user';
import { UserPointsType } from '@/types/user';
// hooks/useUserPoints.ts
import { useState, useCallback } from "react";
import api from "@/lib/axios";

interface UseUserPointsProps {
  userId?: string;
  name?: string;
  email?: string;
}

export function useUserPoints({ userId, name, email }: UseUserPointsProps) {
  const [userPoints, setUserPoints] = useState<UserPointsType | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);

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
      // fallback
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

  return {
    userPoints,
    pointsLoading,
    getUserPoints,
  };
}
