import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserPointsResponse, UserPointsType } from '@/types/user';
import api from '@/lib/axios';

interface UserPointsContextType {
  userPoints: UserPointsType | null;
  pointsLoading: boolean;
  getUserPoints: () => Promise<void>;
  updateUserPoints: (points: Partial<UserPointsType>) => void;
  clearUserPoints: () => void;
}

const UserPointsContext = createContext<UserPointsContextType | undefined>(undefined);

interface UserPointsProviderProps {
  children: React.ReactNode;
  userId?: string;
  name?: string;
  email?: string;
}

export function UserPointsProvider({ children, userId, name, email }: UserPointsProviderProps) {
  const [userPoints, setUserPoints] = useState<UserPointsType | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

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

  // Auto-fetch on mount or when userId changes
  useEffect(() => {
    if (userId && !hasInitialized) {
      getUserPoints();
      setHasInitialized(true);
    }
  }, [userId, getUserPoints, hasInitialized]);

  const updateUserPoints = useCallback((updates: Partial<UserPointsType>) => {
    setUserPoints(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const clearUserPoints = useCallback(() => {
    setUserPoints(null);
    setHasInitialized(false);
  }, []);

  const value = {
    userPoints,
    pointsLoading,
    getUserPoints,
    updateUserPoints,
    clearUserPoints,
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
    throw new Error('useUserPoints must be used within a UserPointsProvider');
  }
  
  return context;
}