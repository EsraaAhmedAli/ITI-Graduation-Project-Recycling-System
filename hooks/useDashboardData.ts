// hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

import { normalizeApiResponse, transformUserGrowthData, transformCitiesData } from '../utils/dataTransformers';
import { DashboardData, LoadingState } from '@/components/Types/dashboard.types';

const initialLoadingState: LoadingState = {
  analytics: true,
  users: true,
  materials: true,
  userStats: true,
  cities: true,
  categories: true,
};

const initialData: DashboardData = {
  totalOrders: 0,
  orderStatus: {},
  ordersPerDay: [],
  topUsers: [],
  userGrowth: [],
  topMaterials: [],
  citiesData: null,
  categories: [],
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState<LoadingState>(initialLoadingState);
  const [error, setError] = useState<string | null>(null);

  const updateLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      updateLoading('analytics', true);
      const res = await api.get("/orders/analytics");
      const json = normalizeApiResponse(res.data);
      
      if (json.success) {
        setData(prev => ({
          ...prev,
          totalOrders: json.data.totalOrders,
          orderStatus: json.data.statusCounts,
          ordersPerDay: json.data.dailyOrders || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics data");
    } finally {
      updateLoading('analytics', false);
    }
  }, [updateLoading]);

  const fetchTopUsers = useCallback(async () => {
    try {
      updateLoading('users', true);
      const res = await api.get("/users/points/leaderboard");
      const json = normalizeApiResponse(res.data);
      
      if (json.success) {
        setData(prev => ({ ...prev, topUsers: json.data }));
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
      setError("Failed to fetch users data");
    } finally {
      updateLoading('users', false);
    }
  }, [updateLoading]);

const fetchTopMaterials = useCallback(async (category = 'All') => {
  try {
    updateLoading('materials', true);
    const params = category !== 'All' ? { category } : {};
    
    // Add timestamp to prevent caching
    const res = await api.get("/top-materials-recycled", { 
      params: { ...params, _t: Date.now() } 
    });
    
    const json = normalizeApiResponse(res.data);
    
    if (json.success) {
      setData(prev => ({ ...prev, topMaterials: json.data }));
    }
  } catch (error) {
    console.error("Error fetching top materials:", error);
    setError("Failed to fetch materials data");
  } finally {
    updateLoading('materials', false);
  }
}, [updateLoading]);

  const fetchUserStats = useCallback(async () => {
    try {
      updateLoading('userStats', true);
      const res = await api.get("/stats");
      const data = normalizeApiResponse(res.data);
      
      const transformedData = transformUserGrowthData(data);
      setData(prev => ({ ...prev, userGrowth: transformedData }));
    } catch (error) {
      console.error("Error fetching user growth:", error);
      setError("Failed to fetch user statistics");
    } finally {
      updateLoading('userStats', false);
    }
  }, [updateLoading]);

  const fetchTopCities = useCallback(async () => {
    try {
      updateLoading('cities', true);
      const res = await api.get('/orders/analytics/top-cities');
      const data = normalizeApiResponse(res.data);
      
      const chartData = transformCitiesData(data);
      setData(prev => ({ ...prev, citiesData: chartData }));
    } catch (error) {
      console.error("Error fetching top cities:", error);
      setError("Failed to fetch cities data");
    } finally {
      updateLoading('cities', false);
    }
  }, [updateLoading]);

  const fetchCategories = useCallback(async () => {
    try {
      updateLoading('categories', true);
      const res = await api.get("categories/get-items");
      const json = normalizeApiResponse(res.data);
      
      if (json.success) {
        setData(prev => ({ ...prev, categories: json.data }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories data");
    } finally {
      updateLoading('categories', false);
    }
  }, [updateLoading]);

  // Optimized fetch all data with Promise.allSettled
  const fetchAllData = useCallback(async () => {
    setError(null);
    
    const results = await Promise.allSettled([
      fetchAnalytics(),
      fetchTopUsers(),
      fetchTopMaterials(),
      fetchUserStats(),
      fetchTopCities(),
      fetchCategories(),
    ]);

    // Check if any promises were rejected
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (errors.length > 0) {
      console.error('Some dashboard data failed to load:', errors);
      // Don't set error state unless all requests fail
      if (errors.length === results.length) {
        setError('Failed to load dashboard data');
      }
    }
  }, [fetchAnalytics, fetchTopUsers, fetchTopMaterials, fetchUserStats, fetchTopCities, fetchCategories]);

  const refetch = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchTopMaterials, // For category filtering
  };
};